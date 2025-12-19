import {
  FetchFileInput,
  FetchFileFactoryInput,
  UpdateFileFactoryInput,
  UpdateFileInput,
  GenerateAIDataInput,
  GenerateAIDataHandlerInput,
} from "./schemas.js";
import { getConfig } from "../../utils/getConfig.js";

export const createFetchFileInput = (
  input: FetchFileFactoryInput
): FetchFileInput => {
  const { WOPEE_PROJECT_UUID } = getConfig();
  if (!WOPEE_PROJECT_UUID) throw new Error("WOPEE_PROJECT_UUID is not set");
  let testCaseId;
  if (input.identifier) {
    // Temporary solution for fetching playwright code for a specific test case TODO: replace with proper identifier later
    const [usId, tcId] = input.identifier.split(":");
    testCaseId = `${usId}/${tcId}`;
  }

  return {
    projectUuid: WOPEE_PROJECT_UUID,
    suiteUuid: input.suiteUuid,
    bucket: input.bucket,
    ...(testCaseId ? { testCaseId } : {}),
  };
};

export const createGenerateAIDataInput = (
  input: GenerateAIDataHandlerInput
): GenerateAIDataInput => {
  const { WOPEE_PROJECT_UUID } = getConfig();
  if (!WOPEE_PROJECT_UUID) throw new Error("WOPEE_PROJECT_UUID is not set");

  return {
    projectUuid: WOPEE_PROJECT_UUID,
    suiteUuid: input.suiteUuid,
    suiteAnalysisConfig: {
      startingUrl: null,
      username: null,
      password: null,
      cookiesPreference: null,
      additionalInstructions: null,
      additionalVariables: null,
    },
    continueGeneration: false,
    extraPrompt: null,
    selectedUserStories: null,
    selectedTestCases: null,
    sourceSuiteUuid: null,
  };
};

export const createUpdateFileInput = (
  input: UpdateFileFactoryInput
): UpdateFileInput => {
  const { WOPEE_PROJECT_UUID } = getConfig();
  if (!WOPEE_PROJECT_UUID) throw new Error("WOPEE_PROJECT_UUID is not set");
  let userStoryId;
  let testCaseId;
  if (input.identifier) {
    [userStoryId, testCaseId] = input.identifier.split(":");
  }

  return {
    bucket: input.bucket,
    projectUuid: WOPEE_PROJECT_UUID,
    suiteUuid: input.suiteUuid,
    [input.outputType === "markdown" || input.outputType === "typescript"
      ? "code"
      : "json"]: input.fileContent,
    ...(userStoryId && testCaseId ? { testCaseId, userStoryId } : {}),
  };
};
