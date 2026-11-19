import {
  GenerateAIDataHandlerInput,
  GenerateAIDataHandlerInputSchema,
} from "../shared/schemas.js";
import { ToolName } from "../shared/types.js";
import { generateAIDataFile } from "../shared/handlers.js";
import { GENERATE_ARTIFACT_DESCRIPTION } from "./description.js";

export const wopeeGenerateArtifact = {
  name: ToolName.WOPEE_GENERATE_ARTIFACT,
  config: {
    title: "Generate test artifacts",
    description: GENERATE_ARTIFACT_DESCRIPTION,
    inputSchema: GenerateAIDataHandlerInputSchema.shape,
  },
  handler: async (input: GenerateAIDataHandlerInput) =>
    await generateAIDataFile(input),
};
