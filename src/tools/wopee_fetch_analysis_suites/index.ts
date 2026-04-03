import { getConfig } from "../../utils/getConfig.js";
import { requestClient } from "../../utils/requestClient.js";
import { _parseError } from "../shared/helpers.js";
import { AnalysisSuite, ToolName } from "../shared/types.js";
import { FetchAnalysisSuites } from "../shared/gql-queries.js";

export const wopeeFetchAnalysisSuites = {
  name: ToolName.WOPEE_FETCH_ANALYSIS_SUITES,
  config: {
    title: "Fetch Analysis Suites",
    description: "Fetch project's analysis suites from Woopee",
  },
  handler: async () => {
    try {
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

      const result = await requestClient<{
        fetchAnalysisSuites: AnalysisSuite[];
      }>(FetchAnalysisSuites, {
        projectUuid: WOPEE_PROJECT_UUID,
      });

      if (!result?.fetchAnalysisSuites)
        return {
          content: [
            {
              type: "text" as const,
              text: "Failed to fetch analysis suites: no data returned",
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
    } catch (error) {
      return _parseError(error);
    }
  },
};
