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
      "Generate AI-powered test artifacts for a suite. Supported types: APP_CONTEXT (analyze the application and create a description), GENERAL_USER_STORIES (generate user stories from app context), USER_STORIES_WITH_TEST_CASES (generate user stories with detailed test cases), TEST_CASES (generate test cases for existing user stories), TEST_CASE_STEPS (generate step-by-step instructions for test cases), REUSABLE_TEST_CASES (generate reusable/shared test cases), REUSABLE_TEST_CASE_STEPS (generate steps for reusable test cases). Typical workflow: generate APP_CONTEXT first, then USER_STORIES_WITH_TEST_CASES, then use wopee_dispatch_agent to execute them.",
    inputSchema: GenerateAIDataHandlerInputSchema.shape,
  },
  handler: async (input: GenerateAIDataHandlerInput) =>
    await generateAIDataFile(input),
};
