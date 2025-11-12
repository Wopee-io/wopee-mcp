import {
  GenerateAIDataHandlerInput,
  GenerateAIDataHandlerInputSchema,
} from "../shared/schemas.js";
import { FileType, ToolName } from "../shared/types.js";
import { generateAIDataFile } from "../shared/handlers.js";

export const wopeeGenerateUserStories = {
  name: ToolName.WOPEE_GENERATE_USER_STORIES,
  config: {
    title: "Generate user stories",
    description: "Generate user stories JSON file for selected suite",
    inputSchema: GenerateAIDataHandlerInputSchema.shape,
  },
  handler: async (input: GenerateAIDataHandlerInput) =>
    await generateAIDataFile(FileType.USER_STORIES, input),
};
