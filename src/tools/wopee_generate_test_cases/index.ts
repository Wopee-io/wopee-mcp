import {
  GenerateAIDataHandlerInput,
  GenerateAIDataHandlerInputSchema,
} from "../shared/schemas.js";
import { FileType, ToolName } from "../shared/types.js";
import { generateAIDataFile } from "../shared/handlers.js";

export const wopeeGenerateTestCases = {
  name: ToolName.WOPEE_GENERATE_TEST_CASES,
  config: {
    title: "Generate test cases",
    description: "Generate test cases for selected suite",
    inputSchema: GenerateAIDataHandlerInputSchema.shape,
  },
  handler: async (input: GenerateAIDataHandlerInput) =>
    await generateAIDataFile(FileType.TEST_CASES, input),
};
