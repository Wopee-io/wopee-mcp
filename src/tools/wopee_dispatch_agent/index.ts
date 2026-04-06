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

export const wopeeDispatchAgent = {
  name: ToolName.WOPEE_DISPATCH_AGENT,
  config: {
    title: "Dispatch autonomous testing agent",
    description:
      "Execute a specific test case by dispatching an autonomous AI agent. The agent opens a real browser, navigates the web app, follows the test case steps, captures screenshots at each step, and reports pass/fail with detailed findings. Prerequisite: test cases must exist in the suite — generate them first with wopee_generate_artifact (type USER_STORIES_WITH_TEST_CASES). Do NOT use this to analyze or crawl an app — use wopee_dispatch_analysis for that. Side effects: creates execution records and screenshots on the Wopee.io platform. Rate limit: 10 seconds between dispatches per project; concurrent calls auto-retry with exponential backoff. On success, returns executed test case results. On failure (invalid suite/test case ID), returns an error message. Use wopee_fetch_executed_test_cases afterward to get full results.",
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
              text: "Failed to dispatch agent: no dispatch result returned",
            },
          ],
        };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result.dispatchAgent, null, 2),
          },
        ],
      };
    } catch (error) {
      return _parseError(error);
    }
  },
};
