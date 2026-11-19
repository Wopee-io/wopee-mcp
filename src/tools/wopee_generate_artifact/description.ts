// The wopee_generate_artifact description, apart from the tool and with no imports so it loads
// under `node --test`. The wait it names is GENERATION_TIMEOUT_MS in request.ts.

export const GENERATE_ARTIFACT_DESCRIPTION = [
  "Generate AI-powered test artifacts for a suite using the Wopee.io AI engine.",
  "Each call creates one artifact type — call multiple times for different types.",
  "Generation order matters: APP_CONTEXT must be generated before user stories, and user stories before test cases. If called out of order, the AI may produce lower quality results.",
  "By default the call waits up to 5 minutes for the generation and returns the generated artifact: APP_CONTEXT or GENERAL_USER_STORIES, or the suite's USER_STORIES (stories with their test cases and steps) for every other type. No wopee_fetch_artifact call is needed after it.",
  "With async: true, for TEST_CASES and USER_STORIES_WITH_TEST_CASES only, the call returns \"Queued: …\" at once; read the result later with wopee_fetch_artifact.",
  "If the 5 minutes pass first, the call fails with a [TIMEOUT] error while the generation goes on: do not call again (that starts a second generation), read the result later with wopee_fetch_artifact, and pass async: true next time for a long TEST_CASES or USER_STORIES_WITH_TEST_CASES generation.",
  "Do NOT use this to hand-edit existing artifacts — use wopee_update_artifact instead.",
  "TEST_CASES runs in UPDATE mode by default: existing test cases keep their steps and run history, and `instructions` says what to add or change.",
  "Destructive generations are mode CREATE (replaces the test cases in scope and deletes their steps, runs and code), USER_STORIES_WITH_TEST_CASES (rebuilds every story and test case) and TEST_CASE_STEPS (replaces the steps of the test cases in scope): use them only when the user explicitly asks for that, and scope them with selectedUserStories / selectedTestCases when the user named stories or test cases.",
  "Login credentials are project variables, referenced in steps as ${TESTING_USERNAME} / ${TESTING_PASSWORD}: check which exist with wopee_fetch_variables and set missing ones with wopee_update_variables before generating.",
  "Never put a password or other secret value in `instructions` — it would be copied into the artifact.",
].join(" ");
