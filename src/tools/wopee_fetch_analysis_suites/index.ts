import { getConfig } from "../../utils/getConfig.js";
import { requestClient } from "../../utils/requestClient.js";
import { AnalysisSuite, ToolName } from "../shared/types.js";
import { FetchAnalysisSuites } from "../shared/gql-queries.js";

export const wopeeFetchAnalysisSuites = {
  name: ToolName.WOPEE_FETCH_ANALYSIS_SUITES,
  config: {
    title: "Fetch Analysis Suites",
    description: "Fetch project's analysis suites from Woopee",
  },
  handler: async () => {
    const { WOPEE_PROJECT_UUID } = getConfig();

    if (!WOPEE_PROJECT_UUID)
      return {
        content: [
          {
            type: "text" as const,
            text: "WOPEE_PROJECT_UUID is not set",
          },
        ],
      };

    const result: { fetchAnalysisSuites: AnalysisSuite[] } | null =
      await requestClient(FetchAnalysisSuites, {
        projectUuid: WOPEE_PROJECT_UUID,
      });

    if (!result || !result.fetchAnalysisSuites)
      return {
        content: [
          {
            type: "text" as const,
            text: "Failed to fetch analysis suites",
          },
        ],
      };

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result.fetchAnalysisSuites, null, 2),
        },
      ],
    };
  },
};
