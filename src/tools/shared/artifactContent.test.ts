// Run with: node --test src/tools/shared/artifactContent.test.ts
// (Node >= 22.6 strips TS types natively; no test framework dependency.)
import { test } from "node:test";
import assert from "node:assert/strict";

import { compactUserStoriesContent } from "./artifactContent.ts";

// backlog#4252 — the api now commits tests.json indented so PR diffs are
// reviewable. That whitespace must not reach the model's context, where it is
// pure token cost.
test("compacts a pretty-printed tests.json", () => {
  const pretty = JSON.stringify(
    {
      userStories: [
        { userStoryId: "US001", testCases: [{ testCaseId: "TC001" }] },
      ],
    },
    null,
    2,
  );

  const compact = compactUserStoriesContent(pretty);

  assert.equal(compact.includes("\n"), false);
  assert.ok(compact.length < pretty.length);
  assert.deepEqual(JSON.parse(compact), JSON.parse(pretty));
});

test("is a no-op for content that is already compact", () => {
  const compact = '{"userStories":[{"userStoryId":"US001","testCases":[]}]}';
  assert.equal(compactUserStoriesContent(compact), compact);
});

test("preserves escaped newlines inside descriptions", () => {
  // Prose descriptions carry real line breaks as `\n` escapes — compacting must
  // only touch structural whitespace, never string contents.
  const pretty = JSON.stringify(
    { userStories: [{ description: "Line 1\nLine 2" }] },
    null,
    2,
  );
  const compact = compactUserStoriesContent(pretty);

  assert.equal(
    JSON.parse(compact).userStories[0].description,
    "Line 1\nLine 2",
  );
});

test("returns unparseable content untouched rather than nothing", () => {
  // A broken artifact is still worth showing the model — it can say so.
  const broken = '{"userStories": }';
  assert.equal(compactUserStoriesContent(broken), broken);
});
