import { requestClient } from "../../utils/requestClient.js";
import { withRetry } from "../../utils/withRetry.js";
import { _parseError } from "../shared/helpers.js";
import { ToolName, VariableLevel } from "../shared/types.js";
import {
  UpdateProjectVariables,
  UpdateSuiteVariables,
} from "../shared/gql-queries.js";
import {
  createUpdateProjectVariablesInput,
  createUpdateSuiteVariablesInput,
} from "./factory.js";
import {
  WopeeUpdateVariablesInput,
  WopeeUpdateVariablesInputSchema,
} from "./schema.js";

const textResult = (text: string) => ({
  content: [{ type: "text" as const, text }],
});

export const wopeeUpdateVariables = {
  name: ToolName.WOPEE_UPDATE_VARIABLES,
  config: {
    title: "Update run-time variables",
    description:
      "Upsert the run-time variables (additionalVariables) that drive analysis/agent runs, at either level. level: PROJECT writes the project-level variables (uses WOPEE_PROJECT_UUID from the environment); level: ANALYSIS writes a specific analysis suite's variables and requires suiteUuid. Merge semantics: keys in variables[] are added or overwritten, existing keys not listed are preserved. Keys must be uppercase (e.g. BASE_URL); the server re-sanitizes and drops invalid keys. Returns a confirmation on success.",
    inputSchema: WopeeUpdateVariablesInputSchema.shape,
  },
  handler: async (input: WopeeUpdateVariablesInput) => {
    try {
      const { level, suiteUuid } = input;

      if (level === VariableLevel.ANALYSIS) {
        if (!suiteUuid)
          return textResult("suiteUuid is required when level is ANALYSIS");

        const result = await withRetry(() =>
          requestClient<{ updateSuiteVariables: boolean }>(
            UpdateSuiteVariables,
            createUpdateSuiteVariablesInput(input),
          ),
        );

        if (!result?.updateSuiteVariables)
          return textResult("Failed to update suite variables");

        return textResult("Suite variables updated successfully");
      }

      const result = await withRetry(() =>
        requestClient<{ updateProjectVariables: boolean }>(
          UpdateProjectVariables,
          createUpdateProjectVariablesInput(input),
        ),
      );

      if (!result?.updateProjectVariables)
        return textResult("Failed to update project variables");

      return textResult("Project variables updated successfully");
    } catch (error) {
      return _parseError(error);
    }
  },
};
