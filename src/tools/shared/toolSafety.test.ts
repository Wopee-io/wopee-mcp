// Run with: node --test src/tools/shared/toolSafety.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";

import { TOOL_SAFETY, callsWriteTool } from "./toolSafety.ts";

const safety = Object.entries(TOOL_SAFETY);

test("every tool folder has an entry", () => {
  const folders = readdirSync(new URL("..", import.meta.url), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("wopee_"))
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(Object.keys(TOOL_SAFETY).sort(), folders);
});

test("a tool that writes is never hinted read-only, and a reader never destructive", () => {
  for (const [name, { writes, annotations }] of safety) {
    assert.equal(annotations.readOnlyHint, !writes, name);
    if (!writes) assert.equal(annotations.destructiveHint, false, name);
  }
});

test("tools that overwrite stored work are hinted destructive", () => {
  for (const name of ["wopee_update_artifact", "wopee_update_variables", "wopee_generate_artifact"] as const) {
    assert.equal(TOOL_SAFETY[name].annotations.destructiveHint, true, name);
  }
});

test("tools that return stored content are marked", () => {
  for (const name of ["wopee_fetch_artifact", "wopee_fetch_executed_test_cases", "wopee_read_chat_history"] as const) {
    assert.equal(TOOL_SAFETY[name].returnsProjectData, true, name);
  }
});

test("only a call of a writing tool counts as one", () => {
  const call = (name: unknown) => ({ method: "tools/call", params: { name } });
  assert.equal(callsWriteTool(call("wopee_dispatch_agent")), true);
  assert.equal(callsWriteTool(call("wopee_fetch_artifact")), false);
  assert.equal(callsWriteTool(call("no_such_tool")), false);
  assert.equal(callsWriteTool(call("constructor")), false);
  assert.equal(callsWriteTool(call(5)), false);
  assert.equal(callsWriteTool({ method: "tools/list" }), false);
  assert.equal(callsWriteTool(null), false);
});
