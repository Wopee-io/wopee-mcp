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
    title: "Dispatch analysis crawl",
    description:
      "Create a new analysis suite and dispatch an AI crawling agent to explore and analyze a web application. The agent autonomously navigates the app starting from a given URL, discovers pages, and builds a sitemap. Optionally accepts login credentials, cookie preferences, custom variables, and additional instructions to guide the crawl. Use this instead of wopee_create_blank_suite when you want to auto-analyze a web app in one step. Rate limit: 10 seconds between dispatches per project; concurrent calls auto-retry with backoff. Returns the created analysis suite.",
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
