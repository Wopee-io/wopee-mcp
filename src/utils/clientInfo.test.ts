// Run with: node --test src/utils/clientInfo.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { clientLabel, setClientInfo } from "./clientInfo.ts";

test("the client reads as name/version, name alone, or unknown", () => {
  assert.equal(clientLabel(), "unknown");
  setClientInfo({ name: "claude-code", version: "2.1.3" });
  assert.equal(clientLabel(), "claude-code/2.1.3");
  setClientInfo({ name: "cursor" });
  assert.equal(clientLabel(), "cursor");
  setClientInfo(undefined);
  assert.equal(clientLabel(), "unknown");
});
