// Run with: node --test src/utils/requestHeaders.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  dispatchSourceHeaders,
  requestHeaders,
} from "./requestHeaders.ts";

test("inside Commander (a token) the run tools mark their requests ASSISTANT", () => {
  const headers = requestHeaders({
    authToken: "token-1",
    apiKey: null,
    extra: dispatchSourceHeaders("token-1"),
  });

  assert.equal(headers["x-wopee-dispatch-source"], "ASSISTANT");
  assert.equal(headers.authorization, "Bearer token-1");
});

test("other requests carry no such mark", () => {
  const headers = requestHeaders({ authToken: null, apiKey: "key-1" });

  assert.equal(headers["x-wopee-dispatch-source"], undefined);
  assert.equal(headers.api_key, "key-1");
});

test("extra headers cannot replace the auth or the content type", () => {
  const headers = requestHeaders({
    authToken: "token-1",
    apiKey: null,
    extra: { authorization: "Bearer other", "Content-Type": "text/plain" },
  });

  assert.equal(headers.authorization, "Bearer token-1");
  assert.equal(headers["Content-Type"], "application/json");
});

test("an api key is sent as both api_key and x-api-key", () => {
  const headers = requestHeaders({ authToken: null, apiKey: "key-1" });

  assert.equal(headers.api_key, "key-1");
  assert.equal(headers["x-api-key"], "key-1");
  assert.equal(headers.authorization, undefined);
});

test("a Commander token is sent alone, without the api key headers", () => {
  const headers = requestHeaders({ authToken: "token-1", apiKey: "key-1" });

  assert.equal(headers.authorization, "Bearer token-1");
  assert.equal(headers.api_key, undefined);
  assert.equal(headers["x-api-key"], undefined);
});

test("a run from an external client (an api key) is marked MCP", () => {
  const headers = requestHeaders({
    authToken: null,
    apiKey: "key-1",
    extra: dispatchSourceHeaders(null),
  });

  assert.equal(headers["x-wopee-dispatch-source"], "MCP");
});

test("api key requests carry the client and the setup ref", () => {
  const headers = requestHeaders({
    authToken: null,
    apiKey: "key-1",
    client: "claude-code/2.1.3",
    setupRef: "prompt-md",
    mcpVersion: "1.35.0",
  });

  assert.equal(headers["x-wopee-client"], "claude-code/2.1.3");
  assert.equal(headers["x-wopee-mcp-version"], "1.35.0");
  assert.equal(headers["x-wopee-setup-ref"], "prompt-md");
});

test("without a client the header says unknown, and no setup ref means no header", () => {
  const headers = requestHeaders({ authToken: null, apiKey: "key-1", setupRef: null });

  assert.equal(headers["x-wopee-client"], "unknown");
  assert.equal(headers["x-wopee-setup-ref"], undefined);
});

test("Commander token requests carry no client headers", () => {
  const headers = requestHeaders({
    authToken: "token-1",
    apiKey: null,
    client: "claude-code/2.1.3",
    setupRef: "x",
  });

  assert.equal(headers["x-wopee-client"], undefined);
  assert.equal(headers["x-wopee-setup-ref"], undefined);
});
