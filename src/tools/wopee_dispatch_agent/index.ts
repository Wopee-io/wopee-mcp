import {
  WopeeDispatchAgentInput,
  DispatchAgentInputSchema,
  WopeeDispatchAgentInputSchema,
} from "./schema.js";
import { ExecutedTestCase, ToolName } from "../shared/types.js";
import { _parseError } from "../shared/helpers.js";
import { createDispatchAgentInput } from "./factory.js";
import { DispatchAgent } from "../shared/gql-queries.js";
import { formatDispatchFailure, formatDispatchSuccess } from "./format.js";
import { getConfig } from "../../utils/getConfig.js";
import { errorHint } from "../../utils/requestErrors.js";
import {
  ASSISTANT_DISPATCH_HEADERS,
  requestClient,
} from "../../utils/requestClient.js";
import { withRetry } from "../../utils/withRetry.js";

export const wopeeDispatchAgent = {
  name: ToolName.WOPEE_DISPATCH_AGENT,
  config: {
    title: "Dispatch autonomous testing agent",
    description:
      "Dispatch an autonomous AI agent to execute specific test cases. The agent opens a real browser, navigates the app, follows the test case's steps, and reports results. A test case without steps runs as it is: the agent follows its description and the run records the steps it took, so never generate steps first just to be able to run it. Tests run ASYNCHRONOUSLY (1-3 minutes). This tool returns tracking info confirming dispatch — NOT final results. Do NOT interpret the response as pass/fail. Poll wopee_fetch_recent_executions or wopee_fetch_executed_test_cases every 30-60 s for the verdict (inside the Commander Assistant, results also arrive as a chat notification). Prerequisite: test cases must exist in the suite (generate with wopee_generate_artifact type USER_STORIES_WITH_TEST_CASES).",
    inputSchema: WopeeDispatchAgentInputSchema.shape,
  },
  handler: async (input: WopeeDispatchAgentInput) => {
    try {
      const dispatchAgentInput = createDispatchAgentInput(input);
      const parsedInput = DispatchAgentInputSchema.parse(dispatchAgentInput);

      const result = await withRetry(() =>
        requestClient<{ dispatchAgent: ExecutedTestCase[] }>(
          DispatchAgent,
          { input: parsedInput },
          { headers: ASSISTANT_DISPATCH_HEADERS },
        ),
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
            text: formatDispatchSuccess(result.dispatchAgent, input, {
              insideCommander: Boolean(getConfig().WOPEE_AUTH_TOKEN),
            }),
          },
        ],
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          content: [
            {
              type: "text" as const,
              text: formatDispatchFailure(
                error as Error & { code?: string },
                errorHint((error as { code?: string }).code),
              ),
            },
          ],
        };
      }
      return _parseError(error);
    }
  },
};
