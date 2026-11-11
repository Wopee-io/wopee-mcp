---
name: wopee
description: Test web apps with Wopee.io's AI testing agent through the `wopee` MCP server. Use when the user asks to "test my app", "run the Wopee tests", "run the login test", "did the tests pass?", "how many tests do I have?", "which tests never ran?", "generate tests for my app", "file the failed test as an issue" or "set up Wopee.io", or names Wopee.io, Wopee or Commander in a testing request.
---

# Wopee.io

Wopee.io tests web apps with an AI testing agent that runs in the cloud: it explores the app, writes user stories and test cases, runs them in a real browser and gives a verdict. You drive it through the `wopee` MCP server: 15 tools named `wopee_*` and 3 prompts. Everything happens in one Wopee.io project, the one set by `WOPEE_PROJECT_UUID`.

## Setup

If the `wopee` MCP server is not connected (no `wopee_*` tools are available), fetch and follow:

https://wopee.io/agent-setup/prompt.md

Do not write a config from memory. Never ask the user to paste their API key into the chat.

## Start with the inventory

Call `wopee_fetch_test_inventory` first. It is read-only and answers "what do I have": every analysis (`A001`, `A002`, ...) with all its test cases (`US001:TC001`) and the latest status of each, including `NOT_RUN`. Use it for totals and complete lists; the two execution tools return only tests that have run.

- `UNKNOWN` means the run history could not be read; do not report those tests as not run.
- `verdictGateDisagreed: true` on a `PASSED` test: report it next to the pass.
- Zero tests: the project has no analysis yet. See "No tests yet".

## Run a test case

1. Find the test case that matches the request: `wopee_fetch_test_inventory`, or `wopee_fetch_artifact` with type `USER_STORIES` on the analysis suite. Match on intent, not exact words.
2. Show the user the analysis, the test case identifier and a one-line description, and ask "Run this test?". Never dispatch without a yes.
3. Call `wopee_dispatch_agent` with the **analysis** suite UUID, the analysis identifier and `testCases: [{ userStoryId, testCaseId }]`. Below the Premium plan it takes one test case per call; dispatch several one by one. Each project accepts one dispatch every 10 seconds; the server retries rate-limit answers itself. A test case without steps runs as it is: the agent follows its description and the run records its steps. Do not generate steps first.

The `run-test` prompt walks through the same steps.

## Poll for the verdict

`wopee_dispatch_agent` returns at once with run handles (`executedTestCaseUuid`, `runName`), not a result. Do not report a pass or fail from it.

- Poll `wopee_fetch_recent_executions` (or `wopee_fetch_executed_test_cases` with the analysis suite UUID) every 30-60 seconds. A test run usually takes a few minutes.
- The verdict is `PASSED`, `FAILED` or `INCOMPLETE`. `INCOMPLETE` means the run never established a result (for example an infrastructure error); it says nothing about the app.
- While there is no verdict yet, the status is `IN_QUEUE` or `IN_PROGRESS`. Runs in a project queue one after another.
- `wopee_dispatch_agent` prints two suite UUIDs: "Suite UUID" is the new agent run suite, "Analysis Suite UUID" is the analysis. Fetch results with the analysis suite UUID.
- If you stop waiting, tell the user the run is still going and that you can check again.

## Read results

Report the verdict per test case with the agent's report in one or two sentences: what it did, and for a failure the failing step and expected vs actual. Use the `fetch-test-results` prompt for a table of the latest results per analysis. Commander (https://cmd.wopee.io) shows each run with screenshots.

## File failures

After a `FAILED` verdict, offer to file it. On a yes, call `wopee_create_github_issue` with a title, your summary as `body`, and the run's `executedTestCaseUuid`; Wopee.io adds the failing step, expected vs actual, the screenshot and a link to the run. It needs a GitHub repository connected to the project. Do not file `INCOMPLETE` runs as app bugs.

## No tests yet

`wopee_dispatch_analysis` creates an analysis suite and starts a crawl that explores the app from the starting URL in the project settings and generates user stories and test cases. It cannot take a URL, login or cookie settings; pass extra instructions in `additionalInstructions` and values such as test credentials as `additionalVariables`.

- Ask before you start it: it uses steps of the user's plan, and the free plan has 50.
- It returns at once. Poll `wopee_fetch_analysis_suites` every 30-60 seconds; an analysis takes 5-10 minutes or more. Do not dispatch it again while it runs.
- To build tests from the user's own spec instead, create a suite with `wopee_create_blank_suite`, then `wopee_generate_artifact` (`APP_CONTEXT` first, then `USER_STORIES_WITH_TEST_CASES`) or `wopee_update_artifact` with your own content.

## Change tests and settings

- Ask before every write tool (the `write` rows in the table below).
- `wopee_generate_artifact` with `USER_STORIES_WITH_TEST_CASES`, with `TEST_CASE_STEPS`, or with `TEST_CASES` in `mode: CREATE` replaces existing tests and their run history. Use them on an existing suite only when the user asks for exactly that, and scope them with `selectedUserStories` / `selectedTestCases`. `TEST_CASES` in the default `UPDATE` mode keeps existing tests.
- `wopee_update_artifact` replaces the whole file; fetch it first and send the full new content.
- To point the tests at another environment, set a variable such as `BASE_URL` with `wopee_update_variables` (project or analysis level; merges, never deletes).
- `wopee_send_chat_message` and `wopee_read_chat_history` work only inside the Commander Assistant, not with a project API key.

## When a call fails

- `[USAGE_LIMIT_EXCEEDED]`: the user's plan limit is reached. The message says when the session resets. Do not retry before then; tell the user, who can check usage or upgrade in Commander.
- `[AUTH_ERROR]`, `Not Authorised!` or `HTTP 401`/`403`: the API key does not match the project in `WOPEE_PROJECT_UUID`, or a suite UUID belongs to another project. Retrying will not help; ask the user to check the key and project UUID in their MCP config (https://docs.wopee.io/guides/api-keys/).
- `[RATE_LIMITED]`: wait 10 seconds and try once more.
- `[NETWORK_ERROR]` or `HTTP 5xx`: retry once after a minute, then report it.
- More: https://docs.wopee.io/guides/wopee-mcp/troubleshooting/

## Localhost cannot be reached

The testing agent runs in Wopee.io's cloud, so `localhost`, `127.0.0.1` and private network addresses do not work as the app URL. Ask for a public or staging URL. Private apps need Wopee.io's enterprise connectivity, which the user arranges with Wopee.io.

## Reference

The table is generated from the server's tool and prompt definitions.

<!-- generated:tools start (npm run skill) -->

### Tools (15)

| Tool | Access | What it does |
| --- | --- | --- |
| `wopee_create_blank_suite` | write | Create a new empty analysis suite in the current project. |
| `wopee_fetch_analysis_suites` | read | List all analysis suites in the current project. |
| `wopee_fetch_executed_test_cases` | read | Retrieve results of test cases executed by the autonomous agent. |
| `wopee_fetch_recent_executions` | read | Fetch the most recent test case executions for the current project (up to 20, newest first). |
| `wopee_fetch_test_inventory` | read | The authoritative tool for how many tests exist and their latest status. |
| `wopee_fetch_variables` | read | Read the run-time variables (additionalVariables) that drive analysis/agent runs, at either level. |
| `wopee_update_variables` | write | Upsert the run-time variables (additionalVariables) that drive analysis/agent runs, at either level. |
| `wopee_dispatch_analysis` | write | Create a new analysis suite AND dispatch an AI crawling agent in one step. |
| `wopee_dispatch_agent` | write | Dispatch an autonomous AI agent to execute specific test cases. |
| `wopee_fetch_artifact` | read | Retrieve a specific test artifact from a suite. |
| `wopee_update_artifact` | write | Create or overwrite a test artifact in a suite with caller-supplied content. |
| `wopee_generate_artifact` | write | Generate AI-powered test artifacts for a suite using the Wopee.io AI engine. |
| `wopee_send_chat_message` | write | Send a message to the current project's chat room. |
| `wopee_read_chat_history` | read | Read recent messages from the current project's chat room. |
| `wopee_create_github_issue` | write | Create a new GitHub issue in the project's connected repository. |

### Prompts (3)

| Prompt | What it does |
| --- | --- |
| `fetch-project-summary` | Fetch project summary in pre-formatted markdown tables |
| `fetch-test-results` | Fetch and display test execution results for analysis suites |
| `run-test` | Workflow for running a test — discovers existing suites, finds a matching test case, confirms before dispatching. |

<!-- generated:tools end -->

Full tool reference: https://docs.wopee.io/guides/wopee-mcp/
First test, step by step: https://docs.wopee.io/guides/wopee-mcp/first-test/
