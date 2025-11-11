import { z } from "zod";

const SelectedTestCasesSchema = z.object({
  testCaseId: z.string().min(1, "Test case ID is required"),
  userStoryId: z.string().min(1, "User story ID is required"),
});

export const WopeeDispatchAgentInputSchema = z.object({
  suiteUuid: z.string().min(1, "Suite UUID is required"),
  analysisIdentifier: z.string().min(1, "Analysis identifier is required"),
  testCases: z.array(SelectedTestCasesSchema),
});

export const DispatchAgentInputSchema = z.object({
  projectUuid: z.string().min(1, "Project UUID is required"),
  suiteUuid: z.string().min(1, "Suite UUID is required"),
  analysisIdentifier: z.string().min(1, "Analysis identifier is required"),
  testCases: z.array(SelectedTestCasesSchema),
  skipRateLimitCheck: z.boolean().nullable().default(true),
});

export type DispatchAgentInput = z.infer<typeof DispatchAgentInputSchema>;
export type WopeeDispatchAgentInput = z.infer<
  typeof WopeeDispatchAgentInputSchema
>;
