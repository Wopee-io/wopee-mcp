import { getConfig } from "../../utils/getConfig.js";
import { requestClient } from "../../utils/requestClient.js";
import { _parseError } from "../shared/helpers.js";
import { AnalysisSuite, ToolName } from "../shared/types.js";
import { CreateBlankAnalysisSuite } from "../shared/gql-queries.js";

export const wopeeCreateBlankSuite = {
  name: ToolName.WOPEE_CREATE_BLANK_SUITE,
  config: {
    title: "Create blank analysis suite",
    description:
      "Create a new empty analysis suite in the current project. Use this as the first step when you want to manually build a test suite — the returned suite UUID is needed by wopee_generate_artifact, wopee_fetch_artifact, wopee_update_artifact, and wopee_dispatch_agent. If you want to auto-analyze a web app instead, use wopee_dispatch_analysis which creates and populates a suite in one step. Takes no input parameters; uses WOPEE_PROJECT_UUID from environment. Not idempotent: each call creates a new suite. Returns the suite object with UUID, name, type, and status. Fails if WOPEE_PROJECT_UUID is not configured.",
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
        createBlankAnalysisSuite: AnalysisSuite;
      }>(CreateBlankAnalysisSuite, {
        projectUuid: WOPEE_PROJECT_UUID,
      });

      if (!result?.createBlankAnalysisSuite)
        return {
          content: [
            {
              type: "text" as const,
              text: "Failed to create blank suite: no data returned",
            },
          ],
        };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result.createBlankAnalysisSuite, null, 2),
          },
        ],
      };
    } catch (error) {
      return _parseError(error);
    }
  },
};
