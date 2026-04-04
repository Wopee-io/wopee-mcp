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
      "Run an autonomous AI testing agent on specific test cases within a suite. The agent navigates the web app, executes test steps, captures screenshots, and reports pass/fail results. Requires a suite UUID and test case ID (e.g. TC001) with its parent user story ID (e.g. US001). Use wopee_generate_artifact first to create test cases, then this tool to execute them. Rate limit: 10 seconds between dispatches per project; concurrent calls auto-retry with backoff. Returns executed test case results including status and agent report.",
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
