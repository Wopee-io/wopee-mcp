import { z } from "zod";
import { VariableLevel } from "../shared/types.js";

export const WopeeFetchVariablesInputSchema = z.object({
  level: z
    .enum(VariableLevel)
    .describe(
      "Which variable set to read. PROJECT reads the project-level variables (uses WOPEE_PROJECT_UUID from the environment). ANALYSIS reads a specific analysis suite's variables and requires suiteUuid.",
    ),
  suiteUuid: z
    .string()
    .nullish()
    .describe(
      "UUID of the analysis suite to read variables from. Required when level is ANALYSIS; ignored when level is PROJECT.",
    ),
});

export type WopeeFetchVariablesInput = z.infer<
  typeof WopeeFetchVariablesInputSchema
>;
