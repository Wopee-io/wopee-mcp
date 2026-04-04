import { getConfig } from "../../utils/getConfig.js";
import { requestClient } from "../../utils/requestClient.js";
import { _parseError } from "../shared/helpers.js";
import { AnalysisSuite, ToolName } from "../shared/types.js";
import { FetchAnalysisSuites } from "../shared/gql-queries.js";

export const wopeeFetchAnalysisSuites = {
  name: ToolName.WOPEE_FETCH_ANALYSIS_SUITES,
  config: {
    title: "List analysis suites",
    description:
      "List all analysis suites in the current project. Returns an array of suites with their UUIDs, names, types, and statuses. Use this to find existing suites before generating content or dispatching agents. Takes no input parameters; uses the project configured via WOPEE_PROJECT_UUID. Each suite UUID can be passed to other tools like wopee_generate_artifact, wopee_fetch_artifact, or wopee_dispatch_agent.",
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
