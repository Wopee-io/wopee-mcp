import {
  FetchFileInput,
  GenerateAIDataInput,
  FetchFileFactoryInput,
  GenerateAIDataHandlerInput,
} from "./schemas.js";
import { getConfig } from "../../utils/getConfig.js";

export const createFetchFileInput = (
  input: FetchFileFactoryInput
): FetchFileInput => {
  const { WOPEE_PROJECT_UUID } = getConfig();
  if (!WOPEE_PROJECT_UUID) throw new Error("WOPEE_PROJECT_UUID is not set");

  return {
    projectUuid: WOPEE_PROJECT_UUID,
    suiteUuid: input.suiteUuid,
    bucket: input.bucket,
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
    sourceSuiteUuid: null,
  };
};
