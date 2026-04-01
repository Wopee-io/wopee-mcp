import { z } from "zod";
import { SuiteAnalysisConfigSchema } from "../shared/schemas.js";

enum RerunMode {
  FULL = "FULL",
  CRAWLING = "CRAWLING",
}

const RerunOptionsSchema = z.object({
  suiteUuid: z.string().min(1, "Suite UUID is required"),
  analysisIdentifier: z.string().min(1, "Analysis identifier is required"),
  mode: z.nativeEnum(RerunMode),
});

export const DispatchAnalysisInputSchema = z.object({
  projectUuid: z.string().min(1, "Project UUID is required"),
  suiteAnalysisConfig: SuiteAnalysisConfigSchema,
  rerun: RerunOptionsSchema.nullable().default(null),
});

const AdditionalVariableSchema = z.object({
  key: z
    .string({
      description:
        "Variable name. Must be uppercase with underscores only (e.g. MY_VAR, BASE_URL).",
    })
    .regex(
      /^[A-Z_][A-Z0-9_]*$/,
      "Key must be uppercase alphanumeric with underscores, starting with a letter or underscore",
    ),
  value: z
    .string({ description: "Variable value. Must be a non-empty string." })
    .min(1, "Value must be a non-empty string"),
});

const WopeeRerunOptionsSchema = z.object({
  suiteUuid: z
    .string({
      description: "UUID of the existing suite to rerun.",
    })
    .min(1, "Suite UUID is required"),
  analysisIdentifier: z
    .string({
      description: "Analysis identifier of the existing suite to rerun.",
    })
    .min(1, "Analysis identifier is required"),
  mode: z.nativeEnum(RerunMode, {
    description:
      "Rerun mode: FULL reruns the entire analysis (crawling + analysis), CRAWLING reruns only the crawling phase.",
  }),
});

export const WopeeDispatchAnalysisInputSchema = z.object({
  additionalInstructions: z
    .string({ description: "Additional instructions for the agent" })
    .nullish(),
  additionalVariables: z
    .array(AdditionalVariableSchema, {
      description:
        "Additional environment variables for the analysis. Each variable needs a key (uppercase, e.g. BASE_URL) and a non-empty value.",
    })
    .nullish(),
  rerun: WopeeRerunOptionsSchema.nullish().describe(
    "If provided, reruns an existing analysis suite instead of creating a new one. Requires suiteUuid, analysisIdentifier, and mode.",
  ),
});

export type DispatchAnalysisInput = z.infer<typeof DispatchAnalysisInputSchema>;
export type WopeeDispatchAnalysisInput = z.infer<
  typeof WopeeDispatchAnalysisInputSchema
>;
