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
      "Create a new analysis suite AND dispatch an AI crawling agent in one step. The agent opens a real browser, navigates from the starting URL, discovers pages, and maps the application structure. Use this when you want to auto-analyze a web app — it combines suite creation and crawling. Use wopee_create_blank_suite instead if you want to manually populate the suite. Optionally accepts starting URL, login credentials, cookie preferences (ACCEPT_ALL, DECLINE_ALL, IGNORE), custom variables, and free-text instructions to guide the crawl. Not idempotent: each call creates a new suite and starts a new crawl. Side effects: creates a suite and execution records on the platform. Rate limit: 10 seconds between dispatches per project; concurrent calls auto-retry with exponential backoff. Returns the created suite object on success.",
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
