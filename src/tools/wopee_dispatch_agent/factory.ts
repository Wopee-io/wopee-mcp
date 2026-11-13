import { requireProjectUuid } from "../../utils/getConfig.js";
import { DispatchAgentInput, WopeeDispatchAgentInput } from "./schema.js";

export const createDispatchAgentInput = (
  input: WopeeDispatchAgentInput
): DispatchAgentInput => {
  const WOPEE_PROJECT_UUID = requireProjectUuid();

  return {
    projectUuid: WOPEE_PROJECT_UUID,
    suiteUuid: input.suiteUuid,
    analysisIdentifier: input.analysisIdentifier,
    testCases: input.testCases,
  };
};
