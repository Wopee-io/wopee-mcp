// Run with: node --test src/utils/httpAuth.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  TokenCache,
  TokenChecker,
  bearerToken,
  checkTokenWithApi,
  isAllowedOrigin,
  isReadOnlyToken,
  metadataPath,
  metadataUrl,
  protectedResourceMetadata,
  readHttpConfig,
  wwwAuthenticate,
} from "./httpAuth.ts";

const config = readHttpConfig({
  MCP_RESOURCE_URL: "https://mcp.example.com/mcp/",
  WOPEE_AUTHORIZATION_SERVER: "https://api.example.com/",
  WOPEE_API_URL: "http://api:4000",
  PORT: "9090",
});

test("the config needs the resource and the issuer; the api URL falls back to the issuer", () => {
  assert.deepEqual(config, {
    resourceUrl: "https://mcp.example.com/mcp",
    issuer: "https://api.example.com",
    apiUrl: "http://api:4000",
    port: 9090,
  });
  assert.equal(
    readHttpConfig({ MCP_RESOURCE_URL: "https://m.example/mcp", WOPEE_AUTHORIZATION_SERVER: "https://a.example" })
      .apiUrl,
    "https://a.example",
  );
  assert.throws(() => readHttpConfig({ MCP_RESOURCE_URL: "https://m.example/mcp" }), /required/);
});

test("RFC 9728 metadata names the resource and the api as its authorization server", () => {
  assert.equal(metadataPath(config.resourceUrl), "/.well-known/oauth-protected-resource/mcp");
  assert.equal(metadataUrl(config.resourceUrl), "https://mcp.example.com/.well-known/oauth-protected-resource/mcp");
  assert.deepEqual(protectedResourceMetadata(config), {
    resource: "https://mcp.example.com/mcp",
    authorization_servers: ["https://api.example.com"],
    scopes_supported: ["read", "write"],
    bearer_methods_supported: ["header"],
    resource_name: "Wopee.io",
    resource_documentation: "https://docs.wopee.io/",
  });
});

test("a 401 points the client at the metadata, with invalid_token for a refused token", () => {
  const meta = "https://mcp.example.com/.well-known/oauth-protected-resource/mcp";
  assert.equal(wwwAuthenticate(config), `Bearer resource_metadata="${meta}"`);
  assert.equal(wwwAuthenticate(config, "invalid_token"), `Bearer resource_metadata="${meta}", error="invalid_token"`);
});

test("only a Bearer header carries a token", () => {
  assert.equal(bearerToken("Bearer abc.def"), "abc.def");
  assert.equal(bearerToken("bearer abc"), "abc");
  assert.equal(bearerToken(["Bearer first", "Bearer second"]), "first");
  assert.equal(bearerToken("Basic abc"), null);
  assert.equal(bearerToken("Bearer"), null);
  assert.equal(bearerToken("Bearer a b"), null);
  assert.equal(bearerToken(undefined), null);
});

const fakeFetch =
  (status: number, body: unknown): typeof fetch =>
  async (_url, init) => {
    const headers = (init?.headers ?? {}) as Record<string, string>;
    assert.equal(headers.authorization, "Bearer the-token");
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  };

test("the api names the token's project, or refuses the token", async () => {
  assert.deepEqual(
    await checkTokenWithApi("http://api", "the-token", fakeFetch(200, { data: { setupCheck: { projectUuid: "p-1" } } })),
    { status: "ok", projectUuid: "p-1" },
  );
  // An MCP token that does not verify, or whose connection is gone.
  assert.deepEqual(
    await checkTokenWithApi("http://api", "the-token", fakeFetch(401, { errors: [{ message: "invalid_token" }] })),
    { status: "invalid" },
  );
  // An unknown API key: the shield's generic refusal.
  assert.deepEqual(
    await checkTokenWithApi("http://api", "the-token", fakeFetch(200, { data: null, errors: [{ message: "Not Authorised!" }] })),
    { status: "invalid" },
  );
});

test("an api that cannot answer is unavailable, never a refused token", async () => {
  const down: typeof fetch = async () => {
    throw new Error("connect ECONNREFUSED");
  };
  assert.equal((await checkTokenWithApi("http://api", "the-token", down)).status, "unavailable");
  assert.equal((await checkTokenWithApi("http://api", "the-token", fakeFetch(502, {}))).status, "unavailable");
  assert.equal(
    (await checkTokenWithApi("http://api", "the-token", fakeFetch(200, { errors: [{ message: "boom" }] }))).status,
    "unavailable",
  );
});

test("a good answer is kept for its TTL, under the token's hash, in a bounded map", () => {
  const cache = new TokenCache(30_000, 2);
  cache.set("token-a", "p-a", 0);
  assert.equal(cache.get("token-a", 29_999), "p-a");
  assert.equal(cache.get("token-a", 30_000), null);
  assert.equal(cache.size, 0);

  cache.set("token-a", "p-a", 0);
  cache.set("token-b", "p-b", 0);
  cache.set("token-c", "p-c", 0);
  assert.equal(cache.size, 2);
  assert.equal(cache.get("token-a", 1), null);
  assert.equal(cache.get("token-c", 1), "p-c");
  assert.equal(cache.get("unknown", 1), null);
});

test("the challenge can name an error and the scopes to ask for", () => {
  assert.match(
    wwwAuthenticate(config, "insufficient_scope", "read write"),
    /error="insufficient_scope", scope="read write"$/,
  );
});

test("only requests without an Origin or from this server's own are allowed", () => {
  assert.equal(isAllowedOrigin(undefined, config.resourceUrl), true);
  assert.equal(isAllowedOrigin("https://mcp.example.com", config.resourceUrl), true);
  assert.equal(isAllowedOrigin("https://elsewhere.example", config.resourceUrl), false);
  assert.equal(isAllowedOrigin("null", config.resourceUrl), false);
});

test("a read limit comes from an MCP token's claims; an API key has none", () => {
  const jwt = (claims: object) =>
    `x.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.y`;
  assert.equal(isReadOnlyToken(jwt({ kind: "mcp", scope: "read" })), true);
  assert.equal(isReadOnlyToken(jwt({ kind: "mcp" })), true);
  assert.equal(isReadOnlyToken(jwt({ kind: "mcp", scope: "write" })), false);
  assert.equal(isReadOnlyToken(jwt({ scope: "read" })), false);
  assert.equal(isReadOnlyToken("wopee-project-api-key"), false);
});

test("a refusal is kept briefly and does not count as a project", () => {
  const cache = new TokenCache(30_000, 10, 5_000);
  cache.refuse("bad", 0);
  assert.equal(cache.isRefused("bad", 4_999), true);
  assert.equal(cache.get("bad", 1), null);
  assert.equal(cache.isRefused("bad", 5_000), false);
  cache.set("good", "p", 0);
  assert.equal(cache.isRefused("good", 1), false);
});

test("the checker shares one api check per token and remembers the answer", async () => {
  let calls = 0;
  const checker = new TokenChecker(async () => {
    calls += 1;
    return { status: "ok", projectUuid: "p-1" };
  });
  const answers = await Promise.all([checker.callerOf("t"), checker.callerOf("t")]);
  assert.deepEqual(answers, [{ projectUuid: "p-1" }, { projectUuid: "p-1" }]);
  await checker.callerOf("t");
  assert.equal(calls, 1);
});

test("the checker does not ask again about a refused token", async () => {
  let calls = 0;
  const checker = new TokenChecker(async () => {
    calls += 1;
    return { status: "invalid" };
  });
  assert.deepEqual(await checker.callerOf("bad"), { status: 401 });
  assert.deepEqual(await checker.callerOf("bad"), { status: 401 });
  assert.equal(calls, 1);
});

test("the checker turns away new tokens while too many checks run, and keeps no outage", async () => {
  let release = (_value: { status: "unavailable"; reason: string }) => {};
  const pending = new Promise<{ status: "unavailable"; reason: string }>((resolve) => {
    release = resolve;
  });
  const logged = console.error;
  console.error = () => {};
  try {
    const cache = new TokenCache();
    const checker = new TokenChecker(() => pending, cache, 1);
    const first = checker.callerOf("a");
    assert.deepEqual(await checker.callerOf("b"), { status: 503 });
    release({ status: "unavailable", reason: "down" });
    assert.deepEqual(await first, { status: 503 });
    assert.equal(cache.isRefused("a"), false);
  } finally {
    console.error = logged;
  }
});
