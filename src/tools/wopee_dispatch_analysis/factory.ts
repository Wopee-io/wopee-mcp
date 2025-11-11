import { getConfig } from "../../utils/getConfig.js";
import type { DispatchAnalysisInput } from "./schema.js";

export const createDispatchAnalysisInput = (): DispatchAnalysisInput => {
  const { WOPEE_PROJECT_UUID } = getConfig();
  if (!WOPEE_PROJECT_UUID) throw new Error("WOPEE_PROJECT_UUID is not set");

  return {
    projectUuid: WOPEE_PROJECT_UUID,
    suiteAnalysisConfig: {
      startingUrl: null,
      username: null,
      password: null,
      cookiesPreference: null,
      additionalInstructions: null,
      additionalVariables: null,
    },
    rerun: null,
  };
};
