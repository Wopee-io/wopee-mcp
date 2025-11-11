import {
  GenerateAIDataHandlerInput,
  GenerateAIDataHandlerInputSchema,
} from "../shared/schemas.js";
import { generateAIDataFile } from "../shared/handlers.js";
import { GenerationType, ToolName } from "../shared/types.js";

export const wopeeGenerateUserStories = {
  name: ToolName.WOPEE_GENERATE_USER_STORIES,
  config: {
    title: "Generate user stories",
    description: "Generate user stories JSON file for selected suite",
    inputSchema: GenerateAIDataHandlerInputSchema.shape,
  },
  handler: async (input: GenerateAIDataHandlerInput) =>
    await generateAIDataFile(GenerationType.USER_STORIES, input),
};
