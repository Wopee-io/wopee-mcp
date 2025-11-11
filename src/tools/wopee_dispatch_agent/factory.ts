import { getConfig } from "../../utils/getConfig.js";
import { DispatchAgentInput, WopeeDispatchAgentInput } from "./schema.js";

export const createDispatchAgentInput = (
  input: WopeeDispatchAgentInput
): DispatchAgentInput => {
  const { WOPEE_PROJECT_UUID } = getConfig();
  if (!WOPEE_PROJECT_UUID) throw new Error("WOPEE_PROJECT_UUID is not set");

  return {
    projectUuid: WOPEE_PROJECT_UUID,
    suiteUuid: input.suiteUuid,
    analysisIdentifier: input.analysisIdentifier,
    testCases: input.testCases,
    skipRateLimitCheck: true,
  };
};
