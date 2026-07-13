import { getConfig } from "../../utils/getConfig.js";
import type { WopeeUpdateVariablesInput } from "./schema.js";

/**
 * Wire payload for the updateSuiteVariables mutation. The handler guarantees
 * suiteUuid is present before calling this (ANALYSIS level).
 */
export const createUpdateSuiteVariablesInput = (
  input: WopeeUpdateVariablesInput,
) => ({
  suiteUuid: input.suiteUuid as string,
  additionalVariables: JSON.stringify(input.variables),
});

/**
 * Wire payload for the updateProjectVariables mutation, injecting
 * WOPEE_PROJECT_UUID from the environment (PROJECT level).
 */
export const createUpdateProjectVariablesInput = (
  input: WopeeUpdateVariablesInput,
) => {
  const { WOPEE_PROJECT_UUID } = getConfig();
  if (!WOPEE_PROJECT_UUID) throw new Error("WOPEE_PROJECT_UUID is not set");

  return {
    input: {
      projectUuid: WOPEE_PROJECT_UUID,
      additionalVariables: JSON.stringify(input.variables),
    },
  };
};
