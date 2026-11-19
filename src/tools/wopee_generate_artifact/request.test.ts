// Run with: node --test src/tools/wopee_generate_artifact/request.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  generationOptions,
  generationTimeoutMessage,
  isQueuedGeneration,
} from "./request.ts";
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

// The api does not stop a generation when the call gives up, so a second call would start another
// one on the same suite: the timeout says to read the result later, never to call again.
test("a timed-out generation says it is still running and how to read it, not to retry", () => {
  const text = generationTimeoutMessage(request({ type: "TEST_CASE_STEPS" }));

  assert.match(text, /^\[TIMEOUT\] The TEST_CASE_STEPS generation did not finish within 5 minutes, but it is still running/);
  assert.match(text, /Do not call wopee_generate_artifact again/);
  assert.match(text, /Read the result with wopee_fetch_artifact/);
  assert.doesNotMatch(text, /retryable|async: true/);
});

test("a timed-out generation the api can queue points to async: true", () => {
  for (const type of ["TEST_CASES", "USER_STORIES_WITH_TEST_CASES"]) {
    assert.match(
      generationTimeoutMessage(request({ type })),
      new RegExp(`pass async: true to get an answer at once for a long ${type} generation`),
      type,
    );
  }
});
