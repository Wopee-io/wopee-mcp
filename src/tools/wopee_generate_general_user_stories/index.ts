import {
  GenerateAIDataHandlerInput,
  GenerateAIDataHandlerInputSchema,
} from "../shared/schemas.js";
import { generateAIDataFile } from "../shared/handlers.js";
import { GenerationType, ToolName } from "../shared/types.js";

export const wopeeGenerateGeneralUserStories = {
  name: ToolName.WOPEE_GENERATE_GENERAL_USER_STORIES,
  config: {
    title: "Generate general user stories",
    description:
      "Generate general user stories markdown file for selected suite",
    inputSchema: GenerateAIDataHandlerInputSchema.shape,
  },
  handler: async (input: GenerateAIDataHandlerInput) =>
    await generateAIDataFile(GenerationType.GENERAL_USER_STORIES, input),
};
