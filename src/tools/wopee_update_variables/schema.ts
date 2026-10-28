import { z } from "zod";
import { VariableLevel } from "../shared/types.js";
import { AdditionalVariableSchema } from "../shared/schemas.js";

export const WopeeUpdateVariablesInputSchema = z.object({
  level: z
    .enum(VariableLevel)
    .describe(
      "Which variable set to write. PROJECT writes the project-level variables (uses WOPEE_PROJECT_UUID from the environment). ANALYSIS writes a specific analysis suite's variables and requires suiteUuid.",
    ),
  suiteUuid: z
    .string()
    .nullish()
    .describe(
      "UUID of the analysis suite to write variables to. Required when level is ANALYSIS; ignored when level is PROJECT.",
    ),
  variables: z
    .array(AdditionalVariableSchema)
    .describe(
      "Variables to upsert. Each needs an uppercase key (e.g. BASE_URL) and a non-empty value. Merge semantics: keys listed here are added or overwritten; existing keys not listed here are preserved.",
    ),
});

export type WopeeUpdateVariablesInput = z.infer<
  typeof WopeeUpdateVariablesInputSchema
>;
