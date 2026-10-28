import { z } from "zod";

const SelectedTestCasesSchema = z.object({
  testCaseId: z
    .string()
    .min(1, "Test case ID is required")
    .describe(
      "ID of the test case belonging to the user story to dispatch the agent for (ex. TC001)",
    ),
  userStoryId: z
    .string()
    .min(1, "User story ID is required")
    .describe("ID of the user story that the test case belongs to (ex. US001)"),
});

export const WopeeDispatchAgentInputSchema = z.object({
  suiteUuid: z
    .string()
    .min(1, "Suite UUID is required")
    .describe("UUID of the suite to dispatch the agent for"),
  analysisIdentifier: z
    .string()
    .min(1, "Analysis identifier is required")
    .describe("Analysis identifier of the suite to dispatch the agent for"),
  testCases: z
    .array(SelectedTestCasesSchema)
    .describe("Chosen test cases to dispatch the agent for"),
});

export const DispatchAgentInputSchema = z.object({
  projectUuid: z.string().min(1, "Project UUID is required"),
  suiteUuid: z.string().min(1, "Suite UUID is required"),
  analysisIdentifier: z.string().min(1, "Analysis identifier is required"),
  testCases: z.array(SelectedTestCasesSchema),
});

export type DispatchAgentInput = z.infer<typeof DispatchAgentInputSchema>;
export type WopeeDispatchAgentInput = z.infer<
  typeof WopeeDispatchAgentInputSchema
>;
