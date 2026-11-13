import {
  FetchArtifactInput,
  FetchArtifactFactoryInput,
  UpdateArtifactFactoryInput,
  UpdateArtifactInput,
  GenerateAIDataInput,
  GenerateAIDataHandlerInput,
} from "./schemas.js";
import { requireProjectUuid } from "../../utils/getConfig.js";
import { generationOptions } from "../wopee_generate_artifact/request.js";

export const createFetchArtifactInput = (
  input: FetchArtifactFactoryInput
): FetchArtifactInput => {
  const WOPEE_PROJECT_UUID = requireProjectUuid();

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
  const WOPEE_PROJECT_UUID = requireProjectUuid();

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
    sourceSuiteUuid: null,
    ...generationOptions(input),
  };
};

export const createUpdateArtifactInput = (
  input: UpdateArtifactFactoryInput
): UpdateArtifactInput => {
  const WOPEE_PROJECT_UUID = requireProjectUuid();

  const { type, suiteUuid, content, identifier } = input;

  return {
    type,
    content,
    suiteUuid,
    projectUuid: WOPEE_PROJECT_UUID,
    ...(identifier ? { identifier } : {}),
  };
};
