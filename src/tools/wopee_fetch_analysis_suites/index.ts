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
      "List all analysis suites in the current project. Returns an array of suite objects with UUIDs, names, types (ANALYSIS, AGENT, etc.), and running statuses (IDLE, IN_PROGRESS, FINISHED). Use this to discover existing suites before calling other tools — you need a suite UUID for wopee_generate_artifact, wopee_fetch_artifact, wopee_update_artifact, and wopee_dispatch_agent. Read-only: does not create or modify anything. Takes no input; uses WOPEE_PROJECT_UUID from environment. Returns an empty array if no suites exist. Fails if WOPEE_PROJECT_UUID is not configured.",
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
