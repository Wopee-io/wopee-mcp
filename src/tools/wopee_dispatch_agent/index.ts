import {
  WopeeDispatchAgentInput,
  DispatchAgentInputSchema,
  WopeeDispatchAgentInputSchema,
} from "./schema.js";
import { ToolName } from "../shared/types.js";
import { _parseError } from "../shared/helpers.js";
import { createDispatchAgentInput } from "./factory.js";
import { DispatchAgent } from "../shared/gql-queries.js";
import { requestClient } from "../../utils/requestClient.js";
import { withRetry } from "../../utils/withRetry.js";

export const wopeeDispatchAgent = {
  name: ToolName.WOPEE_DISPATCH_AGENT,
  config: {
    title: "Dispatch agent",
    description:
      "Dispatch agent testing for selected suite's test cases. Note: there is a 10-second per-project rate limit between dispatches; concurrent calls will auto-retry with backoff.",
    inputSchema: WopeeDispatchAgentInputSchema.shape,
  },
  handler: async (input: WopeeDispatchAgentInput) => {
    try {
      const dispatchAgentInput = createDispatchAgentInput(input);
      const parsedInput = DispatchAgentInputSchema.parse(dispatchAgentInput);

      const result = await withRetry(() =>
        requestClient<{ dispatchAgent: { uuid: string }[] }>(DispatchAgent, {
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
            text: "Agent dispatched successfully",
          },
        ],
      };
    } catch (error) {
      return _parseError(error);
    }
  },
};
