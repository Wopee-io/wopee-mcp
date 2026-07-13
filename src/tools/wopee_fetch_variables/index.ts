import { getConfig } from "../../utils/getConfig.js";
import { requestClient } from "../../utils/requestClient.js";
import { _parseError } from "../shared/helpers.js";
import { ToolName, VariableLevel } from "../shared/types.js";
import {
  FetchProjectVariables,
  FetchSuiteVariables,
} from "../shared/gql-queries.js";
import {
  WopeeFetchVariablesInput,
  WopeeFetchVariablesInputSchema,
} from "./schema.js";

const textResult = (text: string) => ({
  content: [{ type: "text" as const, text }],
});

export const wopeeFetchVariables = {
  name: ToolName.WOPEE_FETCH_VARIABLES,
  config: {
    title: "Fetch run-time variables",
    description:
      "Read the run-time variables (additionalVariables) that drive analysis/agent runs, at either level. level: PROJECT returns the project-level variables (uses WOPEE_PROJECT_UUID from the environment); level: ANALYSIS returns a specific analysis suite's variables and requires suiteUuid. Read-only. Returns a JSON string array of { key, value, sourceType } entries, or [] when none are set. Use wopee_fetch_analysis_suites to discover suite UUIDs.",
    inputSchema: WopeeFetchVariablesInputSchema.shape,
  },
  handler: async (input: WopeeFetchVariablesInput) => {
    try {
      const { level, suiteUuid } = input;

      if (level === VariableLevel.ANALYSIS) {
        if (!suiteUuid)
          return textResult("suiteUuid is required when level is ANALYSIS");

        const result = await requestClient<{
          fetchSuiteVariables: string | null;
        }>(FetchSuiteVariables, { suiteUuid });

        return textResult(result?.fetchSuiteVariables ?? "[]");
      }

      const { WOPEE_PROJECT_UUID } = getConfig();
      if (!WOPEE_PROJECT_UUID) return textResult("WOPEE_PROJECT_UUID is not set");

      const result = await requestClient<{
        fetchProjectVariables: string | null;
      }>(FetchProjectVariables, { projectUuid: WOPEE_PROJECT_UUID });

      return textResult(result?.fetchProjectVariables ?? "[]");
    } catch (error) {
      return _parseError(error);
    }
  },
};
