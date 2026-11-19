// Run with: node --test src/tools/wopee_generate_artifact/description.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

import { GENERATE_ARTIFACT_DESCRIPTION as description } from "./description.ts";
import { GENERATION_TIMEOUT_MS } from "./request.ts";

const minutes = GENERATION_TIMEOUT_MS / 60_000;

// An agent that reads "generation started" polls wopee_fetch_artifact for what it already has.
test("says a default call waits and returns the artifact, with no fetch needed", () => {
  assert.doesNotMatch(description, /generation started/i);
  assert.match(description, new RegExp(`By default the call waits up to ${minutes} minutes`));
  assert.match(description, /returns the generated artifact/);
  assert.match(description, /No wopee_fetch_artifact call is needed/);
});

test("says async: true queues only TEST_CASES and USER_STORIES_WITH_TEST_CASES", () => {
  assert.match(
    description,
    /async: true, for TEST_CASES and USER_STORIES_WITH_TEST_CASES only, the call returns "Queued: …" at once; read the result later with wopee_fetch_artifact/,
  );
});

test("says what to do after a timeout, without calling again", () => {
  assert.match(description, new RegExp(`If the ${minutes} minutes pass first, the call fails with a \\[TIMEOUT\\] error`));
  assert.match(description, /do not call again/);
  assert.match(description, /read the result later with wopee_fetch_artifact, and pass async: true next time/);
});
