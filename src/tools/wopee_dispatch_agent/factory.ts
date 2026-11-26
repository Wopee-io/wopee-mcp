import { requireProjectUuid } from "../../utils/getConfig.js";
import { DispatchAgentInput, WopeeDispatchAgentInput } from "./schema.js";

export const createDispatchAgentInput = (
  input: WopeeDispatchAgentInput,
): DispatchAgentInput => {
  const WOPEE_PROJECT_UUID = requireProjectUuid();

  return {
    projectUuid: WOPEE_PROJECT_UUID,
    suiteUuid: input.suiteUuid,
    analysisIdentifier: input.analysisIdentifier,
    testCases: input.testCases.map(
      ({ userStoryId, testCaseId, stepsGenerationRequested }) => ({
        userStoryId,
        testCaseId,
        // Only an opt-out goes to the api. It already saves the steps of step-less test cases,
        // and a true would make it re-record the steps of a test case that has them.
        ...(stepsGenerationRequested === false && { stepsGenerationRequested }),
      }),
    ),
  };
};
