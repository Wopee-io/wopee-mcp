import { PromptName } from "../shared/types.js";

export const runTest = {
  name: PromptName.RUN_TEST,
  config: {
    title: "Run a test",
    description:
      "Workflow for running a test — discovers existing suites, finds a matching test case, confirms before dispatching. Use when the user asks to run, execute, or try a test.",
  },
  handler: () => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `The user wants to run a test. Follow the "Run a test" workflow below step by step. Do NOT ask the user for URL, login credentials, or "autonomous vs guided" up front.

## "Run a test" workflow

Step 1 — Discover existing suites.
Call 'wopee_fetch_analysis_suites' first. The returned list is the authoritative catalog of apps/suites in this project.

Step 2 — Find a matching test case.
For suites where generatedAnalysisDataState.testCases.isGenerated === true, call 'wopee_fetch_artifact' with type 'USER_STORIES' and scan for a test case that semantically matches the user's request. Match on intent ("add to cart" ≈ "add item to shopping cart"), not literal string equality.

Step 3 — Match found → confirm and dispatch.
Reply with: suite name, test case identifier (e.g. US004:TC006), and a one-line description. End with "Run this test? (yes/no)". Wait for explicit user confirmation before proceeding. On confirmation, call 'wopee_dispatch_agent' with suiteUuid, analysisIdentifier, and the matched testCases (array of { userStoryId, testCaseId }). After dispatch completes, call 'wopee_fetch_executed_test_cases' and summarize pass/fail results plus any failure findings.

Step 4 — No match found → offer concrete options.
If suites exist but no test case matches, reply with exactly three options referencing the existing suites by name:
  1. Run full analysis on <SuiteName> (<url>) — crawl the app, generate user stories + test cases, then pick the right one. Best for broader coverage. (uses 'wopee_dispatch_analysis')
  2. Create just this one test quickly on <SuiteName> — generate APP_CONTEXT + USER_STORIES_WITH_TEST_CASES scoped to this scenario and run it. Fastest. (uses 'wopee_create_blank_suite' if needed, then 'wopee_generate_artifact' for APP_CONTEXT first, then USER_STORIES_WITH_TEST_CASES)
  3. Use a different app — tell me which URL, or say "new" to start fresh.

If the project has zero suites, skip the option list and ask for a URL (the only situation where that question is valid).

Step 5 — Never dispatch silently.
Always show the proposed suite + test case (title + identifier) and wait for explicit confirmation before calling 'wopee_dispatch_agent'. If a tool call fails, state the failure in one sentence and propose the next concrete step — do not retry silently and do not loop.

## Ground rules
- Never re-prompt for information already present in existing suites, artifacts, or prior messages.
- State clearly which suite + test case you are about to run so the user can cancel.
- Keep responses concise — no long explanations unless the user asks.`,
        },
      },
    ],
  }),
};
