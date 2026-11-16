import { _parseError } from "../shared/helpers.js";
import {
  DispatchAnalysisInputSchema,
  WopeeDispatchAnalysisInput,
  WopeeDispatchAnalysisInputSchema,
} from "./schema.js";
import { createDispatchAnalysisInput } from "./factory.js";
import { formatAnalysisDispatched } from "./format.js";
import { DispatchAnalysis } from "../shared/gql-queries.js";
import {
  dispatchSourceHeaders,
  requestClient,
} from "../../utils/requestClient.js";
import { getConfig } from "../../utils/getConfig.js";
import { withRetry } from "../../utils/withRetry.js";
import { AnalysisSuite, ToolName } from "../shared/types.js";

export const wopeeDispatchAnalysis = {
  name: ToolName.WOPEE_DISPATCH_ANALYSIS,
  config: {
    title: "Dispatch analysis crawl",
    description:
      "Create a new analysis suite AND dispatch an AI crawling agent in one step. The agent opens a real browser, navigates from the starting URL, discovers pages, and maps the application structure. Use this when you want to auto-analyze a web app — it combines suite creation and crawling. Use wopee_create_blank_suite instead if you want to manually populate the suite. The crawl starts from the starting URL set in the project settings in Commander; this tool has no starting URL, login or cookie inputs. Optional inputs: free-text instructions to guide the crawl, custom variables (e.g. login details the instructions refer to), and a rerun of an existing suite. Not idempotent: each call creates a new suite and starts a new crawl. Side effects: creates a suite and execution records on the platform. Rate limit: 10 seconds between dispatches per project; concurrent calls auto-retry with exponential backoff. Returns the suite UUID, analysis identifier and status; poll wopee_fetch_analysis_suites every 30-60 s to follow it (5-10 minutes).",
    inputSchema: WopeeDispatchAnalysisInputSchema.shape,
  },

  handler: async (input: WopeeDispatchAnalysisInput) => {
    try {
      const rawInput = createDispatchAnalysisInput(input);
      const parsedInput = DispatchAnalysisInputSchema.parse(rawInput);

      const result = await withRetry(() =>
        requestClient<{ dispatchAnalysis: AnalysisSuite }>(
          DispatchAnalysis,
          { input: parsedInput },
          { headers: dispatchSourceHeaders(getConfig().WOPEE_AUTH_TOKEN) },
        ),
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
            text: formatAnalysisDispatched(result.dispatchAnalysis),
          },
        ],
      };
    } catch (error) {
      return _parseError(error);
    }
  },
};
