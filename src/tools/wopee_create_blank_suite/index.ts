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
      "Create a new empty analysis suite in the current project. Use this as the first step when starting a new testing workflow — the returned suite UUID is required by generate, fetch, update, and dispatch tools. Takes no input parameters; uses the project configured via WOPEE_PROJECT_UUID. Returns the created suite object including its UUID and metadata.",
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
