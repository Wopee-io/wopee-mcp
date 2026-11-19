// Run with: node --test src/tools/shared/toolAvailability.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { COMMANDER_ONLY_TOOLS, offersTool } from "./toolAvailability.ts";
import { TOOL_SAFETY } from "./toolSafety.ts";

const offered = (connection: { insideCommander: boolean; readOnly: boolean }) =>
  Object.entries(TOOL_SAFETY)
    .filter(([name, safety]) => offersTool(name, safety, connection))
    .map(([name]) => name);

const CHAT = ["wopee_send_chat_message", "wopee_read_chat_history"];

// The api lets only a signed-in Commander user use the project chat: with a key it always fails.
test("with a project API key the chat tools are not offered; every other tool is", () => {
  const tools = offered({ insideCommander: false, readOnly: false });

  for (const name of CHAT) assert.equal(tools.includes(name), false, name);
  assert.equal(tools.length, Object.keys(TOOL_SAFETY).length - CHAT.length);
});

test("inside the Commander Assistant every tool is offered, the chat tools too", () => {
  assert.deepEqual(offered({ insideCommander: true, readOnly: false }), Object.keys(TOOL_SAFETY));
});

test("a read-only connection gets no tool that writes, inside Commander or not", () => {
  for (const insideCommander of [true, false]) {
    for (const name of offered({ insideCommander, readOnly: true })) {
      assert.equal(TOOL_SAFETY[name as keyof typeof TOOL_SAFETY].writes, false, name);
    }
  }
  assert.equal(offered({ insideCommander: true, readOnly: true }).includes("wopee_read_chat_history"), true);
});

test("the Commander-only tools are tools the server has", () => {
  for (const name of COMMANDER_ONLY_TOOLS) assert.ok(Object.hasOwn(TOOL_SAFETY, name), name);
});
