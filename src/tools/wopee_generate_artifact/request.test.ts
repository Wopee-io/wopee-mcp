// Run with: node --test src/tools/wopee_generate_artifact/request.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { generationOptions, isQueuedGeneration } from "./request.ts";
import type { GenerateAIDataHandlerInput } from "../shared/schemas.ts";

// What the tool's schema hands the handler: `mode` already defaulted to UPDATE.
const request = (over: Record<string, unknown> = {}) =>
  ({
    type: "TEST_CASES",
    suiteUuid: "s-1",
    mode: "UPDATE",
    ...over,
  }) as GenerateAIDataHandlerInput;

// An unscoped CREATE empties the whole suite: every test case, its steps and its runs. An older api
// reads a missing mode as CREATE, so the mode is always sent, and is CREATE only when asked for.
test("a test case generation that names no mode is sent as UPDATE for the whole suite", () => {
  assert.deepEqual(generationOptions(request()), {
    extraPrompt: null,
    selectedUserStories: null,
    selectedTestCases: null,
    mode: "UPDATE",
  });
});

test("CREATE, a story scope and the instructions are passed through", () => {
  const options = generationOptions(
    request({
      mode: "CREATE",
      selectedUserStories: ["US001", "US003"],
      instructions: "  add a negative test for an expired card ",
    }),
  );

  assert.equal(options.mode, "CREATE");
  assert.deepEqual(options.selectedUserStories, ["US001", "US003"]);
  assert.equal(options.extraPrompt, "add a negative test for an expired card");
});

test("an empty scope and blank instructions are sent as null, which the api reads as none", () => {
  const options = generationOptions(
    request({
      selectedUserStories: [],
      selectedTestCases: [],
      instructions: " ",
    }),
  );

  assert.equal(options.selectedUserStories, null);
  assert.equal(options.selectedTestCases, null);
  assert.equal(options.extraPrompt, null);
});

test("mode is sent only to the test case generation, the only one that reads it", () => {
  const options = generationOptions(
    request({ type: "TEST_CASE_STEPS", selectedTestCases: ["US001:TC002"] }),
  );

  assert.equal("mode" in options, false);
  assert.deepEqual(options.selectedTestCases, ["US001:TC002"]);
});

test("async is sent only where the api can queue the run", () => {
  assert.equal(generationOptions(request({ async: true })).async, true);
  assert.equal(
    isQueuedGeneration(
      request({ type: "USER_STORIES_WITH_TEST_CASES", async: true }),
    ),
    true,
  );

  const steps = request({ type: "TEST_CASE_STEPS", async: true });
  assert.equal(isQueuedGeneration(steps), false);
  assert.equal("async" in generationOptions(steps), false);
  assert.equal("async" in generationOptions(request()), false);
});
