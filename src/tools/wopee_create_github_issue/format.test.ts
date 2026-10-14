import { test } from "node:test";
import assert from "node:assert/strict";
import { formatIssueCreated } from "./format.ts";

const issue = {
  url: "https://github.com/Wopee-io/pw-1/issues/7",
  number: 7,
  title: "Cart total is wrong",
};

test("prints the issue's handles", () => {
  assert.equal(
    formatIssueCreated(issue, { withRunEvidence: false }),
    [
      "GitHub issue created successfully:",
      "- Title: Cart total is wrong",
      "- Number: #7",
      "- URL: https://github.com/Wopee-io/pw-1/issues/7",
    ].join("\n"),
  );
});

test("says what was attached from the run, and what was left out", () => {
  const out = formatIssueCreated(
    {
      ...issue,
      screenshotAttached: false,
      labelsApplied: ["bug"],
      warnings: ["The screenshot could not be attached."],
    },
    { withRunEvidence: true },
  );
  assert.match(out, /- Labels: bug/);
  assert.match(out, /screenshot not attached/);
  assert.match(out, /- Note: The screenshot could not be attached\./);
});

test("reads an api that predates the extra fields", () => {
  assert.doesNotThrow(() =>
    formatIssueCreated(
      { ...issue, screenshotAttached: null, labelsApplied: null, warnings: null },
      { withRunEvidence: true },
    ),
  );
});
