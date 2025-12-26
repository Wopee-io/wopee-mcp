import {
  FetchArtifactInput,
  FetchArtifactFactoryInput,
  UpdateArtifactFactoryInput,
  UpdateArtifactInput,
  GenerateAIDataInput,
  GenerateAIDataHandlerInput,
} from "./schemas.js";
import { getConfig } from "../../utils/getConfig.js";

export const createFetchArtifactInput = (
  input: FetchArtifactFactoryInput
): FetchArtifactInput => {
  const { WOPEE_PROJECT_UUID } = getConfig();
  if (!WOPEE_PROJECT_UUID) throw new Error("WOPEE_PROJECT_UUID is not set");

  const { type, suiteUuid, identifier } = input;

  return {
    type,
    suiteUuid,
    projectUuid: WOPEE_PROJECT_UUID,
    ...(identifier ? { identifier } : {}),
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

export const createUpdateArtifactInput = (
  input: UpdateArtifactFactoryInput
): UpdateArtifactInput => {
  const { WOPEE_PROJECT_UUID } = getConfig();
  if (!WOPEE_PROJECT_UUID) throw new Error("WOPEE_PROJECT_UUID is not set");

  const { type, suiteUuid, content, identifier } = input;

  return {
    type,
    content,
    suiteUuid,
    projectUuid: WOPEE_PROJECT_UUID,
    ...(identifier ? { identifier } : {}),
  };
};
