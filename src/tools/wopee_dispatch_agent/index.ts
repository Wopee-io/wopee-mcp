import {
  WopeeDispatchAgentInput,
  DispatchAgentInputSchema,
  WopeeDispatchAgentInputSchema,
} from "./schema.js";
import { ExecutedTestCase, ToolName } from "../shared/types.js";
import { _parseError } from "../shared/helpers.js";
import { createDispatchAgentInput } from "./factory.js";
import { DispatchAgent } from "../shared/gql-queries.js";
import { requestClient } from "../../utils/requestClient.js";
import { withRetry } from "../../utils/withRetry.js";

function formatDispatchSuccess(
  testCases: ExecutedTestCase[],
  input: WopeeDispatchAgentInput,
): string {
  const lines: string[] = [
    "DISPATCH SUCCESSFUL — tests are now RUNNING (not yet completed).",
    "",
    "Tracking:",
    `- Suite UUID: ${testCases[0]?.suiteUuid ?? input.suiteUuid}`,
    `- Analysis Suite UUID: ${testCases[0]?.analysisSuiteUuid ?? "N/A"}`,
    `- Analysis Identifier: ${testCases[0]?.analysisIdentifier ?? input.analysisIdentifier}`,
    "",
    "Test cases dispatched:",
  ];

  for (const tc of testCases) {
    lines.push(
      `- ${tc.userStoryId}:${tc.testCaseId} → executionStatus: ${tc.executionStatus}`,
    );
  }

  lines.push(
    "",
    "IMPORTANT: These tests are RUNNING asynchronously. Do NOT report them as passed or failed.",
    "Tell the user their tests are running and results will be available shortly (typically 1-3 minutes).",
    "You will receive a follow-up notification in chat when tests complete with full results.",
  );

  return lines.join("\n");
}

export const wopeeDispatchAgent = {
  name: ToolName.WOPEE_DISPATCH_AGENT,
  config: {
    title: "Dispatch autonomous testing agent",
    description:
      "Dispatch an autonomous AI agent to execute specific test cases. The agent opens a real browser, navigates the app, follows test steps, and reports results. Tests run ASYNCHRONOUSLY (1-3 minutes). This tool returns tracking info confirming dispatch — NOT final results. Do NOT interpret the response as pass/fail. Results arrive later via chat notifications. Prerequisite: test cases must exist in the suite (generate with wopee_generate_artifact type USER_STORIES_WITH_TEST_CASES). Use wopee_fetch_recent_executions or wopee_fetch_executed_test_cases to check status later.",
    inputSchema: WopeeDispatchAgentInputSchema.shape,
  },
  handler: async (input: WopeeDispatchAgentInput) => {
    try {
      const dispatchAgentInput = createDispatchAgentInput(input);
      const parsedInput = DispatchAgentInputSchema.parse(dispatchAgentInput);

      const result = await withRetry(() =>
        requestClient<{ dispatchAgent: ExecutedTestCase[] }>(DispatchAgent, {
          input: parsedInput,
        }),
      );

      if (!result?.dispatchAgent?.length)
        return {
          content: [
            {
              type: "text" as const,
              text: "DISPATCH FAILED — tests were NOT started.\nReason: No dispatch result returned from the API.\nSuggest the user try again or check that the suite and test cases exist.",
            },
          ],
        };

      return {
        content: [
          {
            type: "text" as const,
            text: formatDispatchSuccess(result.dispatchAgent, input),
          },
        ],
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `DISPATCH FAILED — tests were NOT started.\nReason: ${error.message}\nThis is a dispatch/infrastructure error, not a test failure. Suggest the user try again.`,
            },
          ],
        };
      }
      return _parseError(error);
    }
  },
};
