import { z } from "zod";

const SelectedTestCasesSchema = z.object({
  testCaseId: z
    .string({
      description:
        "ID of the test case belonging to the user story to dispatch the agent for (ex. TC001)",
    })
    .min(1, "Test case ID is required"),
  userStoryId: z
    .string({
      description:
        "ID of the user story that the test case belongs to (ex. US001)",
    })
    .min(1, "User story ID is required"),
});

export const WopeeDispatchAgentInputSchema = z.object({
  suiteUuid: z
    .string({ description: "UUID of the suite to dispatch the agent for" })
    .min(1, "Suite UUID is required"),
  analysisIdentifier: z
    .string({
      description: "Analysis identifier of the suite to dispatch the agent for",
    })
    .min(1, "Analysis identifier is required"),
  testCases: z.array(SelectedTestCasesSchema, {
    description: "Chosen test cases to dispatch the agent for",
  }),
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
