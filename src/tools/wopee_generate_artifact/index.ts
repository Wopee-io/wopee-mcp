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
      "Generate AI-powered test artifacts for a suite using the Wopee.io AI engine. Each call creates one artifact type — call multiple times for different types. Generation order matters: APP_CONTEXT must be generated before user stories, and user stories before test cases. If called out of order, the AI may produce lower quality results. On success, returns confirmation that generation started. Use wopee_fetch_artifact to retrieve the generated content once ready. Do NOT use this to update existing artifacts — use wopee_update_artifact instead. Generating the same type again overwrites the previous version.",
    inputSchema: GenerateAIDataHandlerInputSchema.shape,
  },
  handler: async (input: GenerateAIDataHandlerInput) =>
    await generateAIDataFile(input),
};
