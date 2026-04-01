import { getConfig } from "../../utils/getConfig.js";
import type {
  DispatchAnalysisInput,
  WopeeDispatchAnalysisInput,
} from "./schema.js";

export const createDispatchAnalysisInput = (
  input: WopeeDispatchAnalysisInput,
): DispatchAnalysisInput => {
  const { WOPEE_PROJECT_UUID } = getConfig();
  if (!WOPEE_PROJECT_UUID) throw new Error("WOPEE_PROJECT_UUID is not set");

  return {
    projectUuid: WOPEE_PROJECT_UUID,
    suiteAnalysisConfig: {
      startingUrl: null,
      username: null,
      password: null,
      cookiesPreference: null,
      additionalInstructions: input.additionalInstructions ?? null,
      additionalVariables: input.additionalVariables?.length
        ? JSON.stringify(input.additionalVariables)
        : null,
    },
    rerun: input.rerun ?? null,
  };
};
