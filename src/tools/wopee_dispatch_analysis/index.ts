import { _parseError } from "../shared/helpers.js";
import {
  DispatchAnalysisInputSchema,
  WopeeDispatchAnalysisInput,
  WopeeDispatchAnalysisInputSchema,
} from "./schema.js";
import { createDispatchAnalysisInput } from "./factory.js";
import { DispatchAnalysis } from "../shared/gql-queries.js";
import { requestClient } from "../../utils/requestClient.js";
import { AnalysisSuite, ToolName } from "../shared/types.js";

export const wopeeDispatchAnalysis = {
  name: ToolName.WOPEE_DISPATCH_ANALYSIS,
  config: {
    title: "Dispatch analysis",
    description: "Create and dispatch analysis/crawling suite for a project",
    inputSchema: WopeeDispatchAnalysisInputSchema.shape,
  },

  handler: async (input: WopeeDispatchAnalysisInput) => {
    try {
      const rawInput = createDispatchAnalysisInput(input);
      const parsedInput = DispatchAnalysisInputSchema.parse(rawInput);

      const result: { dispatchAnalysis: AnalysisSuite } | null =
        await requestClient(DispatchAnalysis, {
          input: parsedInput,
        });
      if (!result || !result.dispatchAnalysis)
        return {
          content: [
            {
              type: "text" as const,
              text: "Failed to dispatch agent",
            },
          ],
        };

      return {
        content: [
          {
            type: "text" as const,
            text: "Agent dispatched successfully",
          },
        ],
      };
    } catch (error) {
      return _parseError(error);
    }
  },
};
