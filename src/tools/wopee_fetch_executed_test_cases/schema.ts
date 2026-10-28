import { z } from "zod";

export const WopeeFetchExecutedTestCasesInputSchema = z.object({
  suiteUuid: z
    .string()
    .min(1, "Suite UUID is required")
    .describe("UUID of the analysis suite to fetch executed test cases for"),
  analysisIdentifier: z
    .string()
    .optional()
    .describe(
      "Analysis identifier of the suite (ex. A068). Can be found in the analysis suite data.",
    ),
});

export const FetchExecutedTestCasesInputSchema = z.object({
  projectUuid: z.string().min(1, "Project UUID is required"),
  analysisSuiteUuid: z.string().min(1, "Suite UUID is required"),
  analysisIdentifier: z.string().optional(),
});

export type WopeeFetchExecutedTestCasesInput = z.infer<
  typeof WopeeFetchExecutedTestCasesInputSchema
>;
export type FetchExecutedTestCasesInput = z.infer<
  typeof FetchExecutedTestCasesInputSchema
>;
