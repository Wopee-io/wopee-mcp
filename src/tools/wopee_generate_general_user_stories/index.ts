import {
  GenerateAIDataHandlerInput,
  GenerateAIDataHandlerInputSchema,
} from "../shared/schemas.js";
import { FileType, ToolName } from "../shared/types.js";
import { generateAIDataFile } from "../shared/handlers.js";

export const wopeeGenerateGeneralUserStories = {
  name: ToolName.WOPEE_GENERATE_GENERAL_USER_STORIES,
  config: {
    title: "Generate general user stories",
    description:
      "Generate general user stories markdown file for selected suite",
    inputSchema: GenerateAIDataHandlerInputSchema.shape,
  },
  handler: async (input: GenerateAIDataHandlerInput) =>
    await generateAIDataFile(FileType.GENERAL_USER_STORIES, input),
};
