// Run with: node --test src/utils/requestHeaders.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  ASSISTANT_DISPATCH_HEADERS,
  requestHeaders,
} from "./requestHeaders.ts";

test("the run tools mark their requests as coming from the Assistant", () => {
  const headers = requestHeaders({
    authToken: "token-1",
    apiKey: null,
    extra: ASSISTANT_DISPATCH_HEADERS,
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
