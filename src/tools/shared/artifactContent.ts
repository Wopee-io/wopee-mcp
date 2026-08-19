/**
 * Strip pretty-printing from `tests.json` before it enters the model's context.
 *
 * The api commits the USER_STORIES artifact indented so the diff of a test-case
 * edit is reviewable in a GitHub PR (autonomous-testing/backlog#4252). That
 * formatting is for humans reading a diff — `fetchArtifact` hands the file
 * straight to the model, where the extra whitespace is pure token cost and buys
 * nothing. `fetch_project_summary` pulls this artifact for every suite in a
 * project, so the cost is multiplied.
 *
 * Fails open: content that does not parse is returned untouched. A broken
 * artifact is still worth showing the model — it can say so.
 *
 * Kept free of enum imports so `node --test` (strip-only TS) can cover it; the
 * artifact-type gate lives in `_compactArtifactContentForModel`.
 */
export function compactUserStoriesContent(content: string): string {
  try {
    return JSON.stringify(JSON.parse(content));
  } catch {
    return content;
  }
}
