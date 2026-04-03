import { z } from "zod";

export const WopeeFetchExecutedTestCasesInputSchema = z.object({
  suiteUuid: z
    .string({
      description: "UUID of the analysis suite to fetch executed test cases for",
    })
    .min(1, "Suite UUID is required"),
  analysisIdentifier: z
    .string({
      description:
        "Analysis identifier of the suite (ex. A068). Can be found in the analysis suite data.",
    })
    .optional(),
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
