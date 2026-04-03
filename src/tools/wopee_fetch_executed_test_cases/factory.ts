import { getConfig } from "../../utils/getConfig.js";
import {
  FetchExecutedTestCasesInput,
  WopeeFetchExecutedTestCasesInput,
} from "./schema.js";

export const createFetchExecutedTestCasesInput = (
  input: WopeeFetchExecutedTestCasesInput,
): FetchExecutedTestCasesInput => {
  const { WOPEE_PROJECT_UUID } = getConfig();
  if (!WOPEE_PROJECT_UUID) throw new Error("WOPEE_PROJECT_UUID is not set");

  return {
    projectUuid: WOPEE_PROJECT_UUID,
    analysisSuiteUuid: input.suiteUuid,
    ...(input.analysisIdentifier
      ? { analysisIdentifier: input.analysisIdentifier }
      : {}),
  };
};
