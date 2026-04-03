import { _parseError } from "../shared/helpers.js";
import {
  DispatchAnalysisInputSchema,
  WopeeDispatchAnalysisInput,
  WopeeDispatchAnalysisInputSchema,
} from "./schema.js";
import { createDispatchAnalysisInput } from "./factory.js";
import { DispatchAnalysis } from "../shared/gql-queries.js";
import { requestClient } from "../../utils/requestClient.js";
import { withRetry } from "../../utils/withRetry.js";
import { AnalysisSuite, ToolName } from "../shared/types.js";

export const wopeeDispatchAnalysis = {
  name: ToolName.WOPEE_DISPATCH_ANALYSIS,
  config: {
    title: "Dispatch analysis",
    description:
      "Create and dispatch analysis/crawling suite for a project. Note: there is a 10-second per-project rate limit between dispatches; concurrent calls will auto-retry with backoff.",
    inputSchema: WopeeDispatchAnalysisInputSchema.shape,
  },

  handler: async (input: WopeeDispatchAnalysisInput) => {
    try {
      const rawInput = createDispatchAnalysisInput(input);
      const parsedInput = DispatchAnalysisInputSchema.parse(rawInput);

      const result = await withRetry(() =>
        requestClient<{ dispatchAnalysis: AnalysisSuite }>(DispatchAnalysis, {
          input: parsedInput,
        }),
      );

      if (!result?.dispatchAnalysis)
        return {
          content: [
            {
              type: "text" as const,
              text: "Failed to dispatch agent: no analysis suite returned",
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
