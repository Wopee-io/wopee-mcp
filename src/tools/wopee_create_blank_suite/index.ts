import { getConfig } from "../../utils/getConfig.js";
import { requestClient } from "../../utils/requestClient.js";
import { AnalysisSuite, ToolName } from "../shared/types.js";
import { CreateBlankAnalysisSuite } from "../shared/gql-queries.js";

export const wopeeCreateBlankSuite = {
  name: ToolName.WOPEE_CREATE_BLANK_SUITE,
  config: {
    title: "Create blank analysis suite",
    description: "Create a blank analysis suite for a project",
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

    const result: { createBlankAnalysisSuite: AnalysisSuite } | null =
      await requestClient(CreateBlankAnalysisSuite, {
        projectUuid: WOPEE_PROJECT_UUID,
      });

    if (!result || !result.createBlankAnalysisSuite)
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
          text: JSON.stringify(result.createBlankAnalysisSuite, null, 2),
        },
      ],
    };
  },
};
