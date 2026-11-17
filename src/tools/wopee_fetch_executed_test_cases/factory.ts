import { requireProjectUuid } from "../../utils/getConfig.js";
import {
  FetchExecutedTestCasesInput,
  WopeeFetchExecutedTestCasesInput,
} from "./schema.js";

export const createFetchExecutedTestCasesInput = (
  input: WopeeFetchExecutedTestCasesInput,
): FetchExecutedTestCasesInput => {
  const WOPEE_PROJECT_UUID = requireProjectUuid();

  return {
    projectUuid: WOPEE_PROJECT_UUID,
    analysisSuiteUuid: input.suiteUuid,
    ...(input.analysisIdentifier
      ? { analysisIdentifier: input.analysisIdentifier }
      : {}),
  };
};
