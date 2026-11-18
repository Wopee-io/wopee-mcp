// The remote (HTTP) server's side of OAuth: it is a resource server. It tells clients where to
// authorize (RFC 9728 metadata, the WWW-Authenticate challenge) and checks each bearer token with
// the api, which also says which project the token is for. Only node: imports, so it loads under
// `node --test` in strip-only mode.
import { createHash } from "node:crypto";

export interface HttpConfig {
  /** The public URL of the MCP endpoint, e.g. https://mcp.wopee.io/mcp: the token audience. */
  resourceUrl: string;
  /** The api's public URL, the OAuth issuer, e.g. https://api.wopee.io. */
  issuer: string;
  /** Where this server sends its api requests (inside the platform network when there is one). */
  apiUrl: string;
  port: number;
}

const trimSlash = (url: string) => url.replace(/\/+$/, "");

export function readHttpConfig(env: NodeJS.ProcessEnv): HttpConfig {
  const resourceUrl = env.MCP_RESOURCE_URL?.trim();
  const issuer = env.WOPEE_AUTHORIZATION_SERVER?.trim();
  if (!resourceUrl || !issuer) {
    throw new Error(
      "MCP_RESOURCE_URL (this server's public /mcp URL) and WOPEE_AUTHORIZATION_SERVER (the api's public URL) are required",
    );
  }
  const port = Number(env.PORT);
  return {
    resourceUrl: trimSlash(new URL(resourceUrl).href),
    issuer: trimSlash(new URL(issuer).href),
    apiUrl: trimSlash(env.WOPEE_API_URL?.trim() || issuer),
    port: Number.isInteger(port) && port > 0 ? port : 8080,
  };
}

/** RFC 9728: the metadata lives under /.well-known/oauth-protected-resource + the resource path. */
export function metadataPath(resourceUrl: string): string {
  const path = new URL(resourceUrl).pathname.replace(/\/+$/, "");
  return `/.well-known/oauth-protected-resource${path}`;
}

export function metadataUrl(resourceUrl: string): string {
  return new URL(metadataPath(resourceUrl), resourceUrl).href;
}

export function protectedResourceMetadata(config: HttpConfig) {
  return {
    resource: config.resourceUrl,
    authorization_servers: [config.issuer],
    scopes_supported: ["read", "write"],
    bearer_methods_supported: ["header"],
    resource_name: "Wopee.io",
    resource_documentation: "https://docs.wopee.io/",
  };
}

/**
 * The `WWW-Authenticate` of a 401 or 403: where the client finds how to get a token, and which
 * scopes to ask for (MCP spec).
 */
export function wwwAuthenticate(
  config: HttpConfig,
  error?: "invalid_token" | "insufficient_scope",
  scope?: string,
): string {
  const parts = [`resource_metadata="${metadataUrl(config.resourceUrl)}"`];
  if (error) parts.push(`error="${error}"`);
  if (scope) parts.push(`scope="${scope}"`);
  return `Bearer ${parts.join(", ")}`;
}

/** No `Origin` (not a browser), or this server's own. */
export function isAllowedOrigin(origin: string | undefined, resourceUrl: string): boolean {
  return origin === undefined || origin === new URL(resourceUrl).origin;
}

/**
 * Whether a token the api has accepted is limited to reading. An MCP access token says so in its
 * claims; a project API key is opaque and has no such limit. Never use this on an unchecked token.
 */
export function isReadOnlyToken(token: string): boolean {
  try {
    const claims = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
    return claims?.kind === "mcp" && claims.scope !== "write";
  } catch {
    return false;
  }
}

/** The token of an `Authorization: Bearer <token>` header, else null. */
export function bearerToken(authorization: string | string[] | undefined): string | null {
  const header = Array.isArray(authorization) ? authorization[0] : authorization;
  const match = /^Bearer\s+(\S+)\s*$/i.exec(header ?? "");
  return match ? match[1] : null;
}

export type TokenCheck =
  | { status: "ok"; projectUuid: string }
  | { status: "invalid" }
  | { status: "unavailable"; reason: string };

const SETUP_CHECK = "query SetupCheck { setupCheck { projectUuid } }";

/**
 * Asks the api who a token is: an MCP access token or a project API key. The api answers
 * `setupCheck` with the token's project, and refuses a token it does not accept (401 for an MCP
 * token that does not verify or whose connection is gone, "Not Authorised!" for an unknown key).
 */
export async function checkTokenWithApi(
  apiUrl: string,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<TokenCheck> {
  let response: Response;
  try {
    response = await fetchImpl(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ query: SETUP_CHECK }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    return { status: "unavailable", reason: error instanceof Error ? error.message : String(error) };
  }
  if (response.status === 401 || response.status === 403) return { status: "invalid" };
  if (!response.ok) return { status: "unavailable", reason: `api answered ${response.status}` };

  const body = (await response.json().catch(() => null)) as {
    data?: { setupCheck?: { projectUuid?: string } | null };
    errors?: { message?: string; extensions?: { code?: string } }[];
  } | null;
  const projectUuid = body?.data?.setupCheck?.projectUuid;
  if (projectUuid) return { status: "ok", projectUuid };
  const error = body?.errors?.[0];
  const refused =
    error?.extensions?.code === "UNAUTHENTICATED" ||
    error?.extensions?.code === "FORBIDDEN" ||
    /not authori[sz]ed/i.test(error?.message ?? "");
  return refused
    ? { status: "invalid" }
    : { status: "unavailable", reason: error?.message ?? "no project in the api's answer" };
}

/**
 * Good answers, kept a short while so a client's burst of messages (initialize, tools/list, the
 * call) costs one check. Keyed by the token's SHA-256, never the token. A refusal is kept for a few
 * seconds, so repeating a bad token does not reach the api each time. The api still checks the
 * connection on every tool call, so a revoked token loses its tools at once; it only stops getting
 * 401 here up to `ttlMs` later.
 */
export class TokenCache {
  private readonly entries = new Map<string, { projectUuid: string | null; until: number }>();
  private readonly ttlMs: number;
  private readonly maxEntries: number;
  private readonly refusedTtlMs: number;

  // No parameter properties: `node --test` strips types and cannot run them.
  constructor(ttlMs = 30_000, maxEntries = 1000, refusedTtlMs = 5_000) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this.refusedTtlMs = refusedTtlMs;
  }

  private key(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private live(token: string, now: number) {
    const key = this.key(token);
    const entry = this.entries.get(key);
    if (entry && entry.until <= now) {
      this.entries.delete(key);
      return undefined;
    }
    return entry;
  }

  private store(token: string, projectUuid: string | null, until: number) {
    const key = this.key(token);
    this.entries.delete(key);
    if (this.entries.size >= this.maxEntries) {
      // The oldest entry goes first (a Map keeps insertion order).
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    this.entries.set(key, { projectUuid, until });
  }

  get(token: string, now = Date.now()): string | null {
    return this.live(token, now)?.projectUuid ?? null;
  }

  isRefused(token: string, now = Date.now()): boolean {
    return this.live(token, now)?.projectUuid === null;
  }

  set(token: string, projectUuid: string, now = Date.now()): void {
    this.store(token, projectUuid, now + this.ttlMs);
  }

  refuse(token: string, now = Date.now()): void {
    this.store(token, null, now + this.refusedTtlMs);
  }

  get size() {
    return this.entries.size;
  }
}

export type Caller = { projectUuid: string } | { status: 401 | 503 };

/**
 * Who a token belongs to, through the cache. Simultaneous requests with one token share one api
 * check, and at most `maxChecks` run at once: beyond that the caller is asked to come back.
 */
export class TokenChecker {
  private readonly running = new Map<string, Promise<Caller>>();
  private readonly check: (token: string) => Promise<TokenCheck>;
  private readonly cache: TokenCache;
  private readonly maxChecks: number;

  constructor(check: (token: string) => Promise<TokenCheck>, cache = new TokenCache(), maxChecks = 20) {
    this.check = check;
    this.cache = cache;
    this.maxChecks = maxChecks;
  }

  private async ask(token: string): Promise<Caller> {
    const answer = await this.check(token);
    if (answer.status === "ok") {
      this.cache.set(token, answer.projectUuid);
      return { projectUuid: answer.projectUuid };
    }
    if (answer.status === "invalid") {
      this.cache.refuse(token);
      return { status: 401 };
    }
    console.error(`[WOPEE]: token check failed: ${answer.reason}`);
    return { status: 503 };
  }

  callerOf(token: string): Promise<Caller> {
    const projectUuid = this.cache.get(token);
    if (projectUuid) return Promise.resolve({ projectUuid });
    if (this.cache.isRefused(token)) return Promise.resolve({ status: 401 });

    const running = this.running.get(token);
    if (running) return running;
    if (this.running.size >= this.maxChecks) return Promise.resolve({ status: 503 });

    const asked = this.ask(token).finally(() => this.running.delete(token));
    this.running.set(token, asked);
    return asked;
  }
}
