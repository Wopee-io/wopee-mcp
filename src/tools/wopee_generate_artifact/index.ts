import {
  GenerateAIDataHandlerInput,
  GenerateAIDataHandlerInputSchema,
} from "../shared/schemas.js";
import { ToolName } from "../shared/types.js";
import { generateAIDataFile } from "../shared/handlers.js";

export const wopeeGenerateArtifact = {
  name: ToolName.WOPEE_GENERATE_ARTIFACT,
  config: {
    title: "Generate test artifacts",
    description:
      "Generate AI-powered test artifacts for a suite using the Wopee.io AI engine. Each call creates one artifact type — call multiple times for different types. Generation order matters: APP_CONTEXT must be generated before user stories, and user stories before test cases. If called out of order, the AI may produce lower quality results. On success, returns confirmation that generation started. Use wopee_fetch_artifact to retrieve the generated content once ready. Do NOT use this to hand-edit existing artifacts — use wopee_update_artifact instead. TEST_CASES runs in UPDATE mode by default: existing test cases keep their steps and run history, and `instructions` says what to add or change. Destructive generations are mode CREATE (replaces the test cases in scope and deletes their steps, runs and code), USER_STORIES_WITH_TEST_CASES (rebuilds every story and test case) and TEST_CASE_STEPS (replaces the steps of the test cases in scope): use them only when the user explicitly asks for that, and scope them with selectedUserStories / selectedTestCases when the user named stories or test cases.",
    inputSchema: GenerateAIDataHandlerInputSchema.shape,
  },
  handler: async (input: GenerateAIDataHandlerInput) =>
    await generateAIDataFile(input),
};
