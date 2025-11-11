import {
  WopeeDispatchAgentInput,
  DispatchAgentInputSchema,
  WopeeDispatchAgentInputSchema,
} from "./schema.js";
import { ToolName } from "../shared/types.js";
import { parseError } from "../shared/handlers.js";
import { createDispatchAgentInput } from "./factory.js";
import { DispatchAgent } from "../shared/gql-queries.js";
import { requestClient } from "../../utils/requestClient.js";

export const wopeeDispatchAgent = {
  name: ToolName.WOPEE_DISPATCH_AGENT,
  config: {
    title: "Dispatch agent",
    description: "Dispatch agent testing for selected suite's test cases",
    inputSchema: WopeeDispatchAgentInputSchema.shape,
  },
  handler: async (input: WopeeDispatchAgentInput) => {
    try {
      const dispatchAgentInput = createDispatchAgentInput(input);
      const parsedInput = DispatchAgentInputSchema.parse(dispatchAgentInput);

      const result: { dispatchAgent: boolean } | null = await requestClient(
        DispatchAgent,
        {
          input: parsedInput,
        }
      );
      if (!result || !result.dispatchAgent)
        return {
          content: [
            {
              type: "text" as const,
              text: "Failed to dispatch agent",
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
      return parseError(error);
    }
  },
};
