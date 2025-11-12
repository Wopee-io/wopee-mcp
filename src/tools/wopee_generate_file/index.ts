import {
  GenerateAIDataHandlerInput,
  GenerateAIDataHandlerInputSchema,
} from "../shared/schemas.js";
import { FileType, ToolName } from "../shared/types.js";
import { generateAIDataFile } from "../shared/handlers.js";

export const wopeeGenerateFile = {
  name: ToolName.WOPEE_GENERATE_FILE,
  config: {
    title: "Generate file(artifact)",
    description: "Generate AI data file for selected suite",
    inputSchema: GenerateAIDataHandlerInputSchema.shape,
  },
  handler: async (input: GenerateAIDataHandlerInput) =>
    await generateAIDataFile(input),
};
