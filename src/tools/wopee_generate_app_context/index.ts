import {
  GenerateAIDataHandlerInput,
  GenerateAIDataHandlerInputSchema,
} from "../shared/schemas.js";
import { generateAIDataFile } from "../shared/handlers.js";
import { GenerationType, ToolName } from "../shared/types.js";

export const wopeeGenerateAppContext = {
  name: ToolName.WOPEE_GENERATE_APP_CONTEXT,
  config: {
    title: "Generate app context",
    description:
      "Generate application's context markdown file for selected suite",
    inputSchema: GenerateAIDataHandlerInputSchema.shape,
  },
  handler: async (input: GenerateAIDataHandlerInput) =>
    await generateAIDataFile(GenerationType.APP_CONTEXT, input),
};
