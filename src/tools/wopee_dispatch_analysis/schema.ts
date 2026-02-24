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

export const WopeeDispatchAnalysisInputSchema = z.object({
  additionalInstructions: z
    .string({ description: "Additional instructions for the agent" })
    .nullish(),
});

export type DispatchAnalysisInput = z.infer<typeof DispatchAnalysisInputSchema>;
export type WopeeDispatchAnalysisInput = z.infer<
  typeof WopeeDispatchAnalysisInputSchema
>;
