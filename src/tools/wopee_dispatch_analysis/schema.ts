import { z } from "zod";
import {
  SuiteAnalysisConfigSchema,
  AdditionalVariableSchema,
} from "../shared/schemas.js";

enum RerunMode {
  FULL = "FULL",
  CRAWLING = "CRAWLING",
}

const RerunOptionsSchema = z.object({
  suiteUuid: z.string().min(1, "Suite UUID is required"),
  analysisIdentifier: z.string().min(1, "Analysis identifier is required"),
  mode: z.enum(RerunMode),
});

export const DispatchAnalysisInputSchema = z.object({
  projectUuid: z.string().min(1, "Project UUID is required"),
  suiteAnalysisConfig: SuiteAnalysisConfigSchema,
  rerun: RerunOptionsSchema.nullable().default(null),
});

const WopeeRerunOptionsSchema = z.object({
  suiteUuid: z
    .string()
    .min(1, "Suite UUID is required")
    .describe("UUID of the existing suite to rerun."),
  analysisIdentifier: z
    .string()
    .min(1, "Analysis identifier is required")
    .describe("Analysis identifier of the existing suite to rerun."),
  mode: z
    .enum(RerunMode)
    .describe(
      "Rerun mode: FULL reruns the entire analysis (crawling + analysis), CRAWLING reruns only the crawling phase.",
    ),
});

export const WopeeDispatchAnalysisInputSchema = z.object({
  additionalInstructions: z
    .string()
    .nullish()
    .describe("Additional instructions for the agent"),
  additionalVariables: z
    .array(AdditionalVariableSchema)
    .nullish()
    .describe(
      "Additional environment variables for the analysis. Each variable needs a key (uppercase, e.g. BASE_URL) and a non-empty value.",
    ),
  rerun: WopeeRerunOptionsSchema.nullish().describe(
    "If provided, reruns an existing analysis suite instead of creating a new one. Requires suiteUuid, analysisIdentifier, and mode.",
  ),
});

export type DispatchAnalysisInput = z.infer<typeof DispatchAnalysisInputSchema>;
export type WopeeDispatchAnalysisInput = z.infer<
  typeof WopeeDispatchAnalysisInputSchema
>;
