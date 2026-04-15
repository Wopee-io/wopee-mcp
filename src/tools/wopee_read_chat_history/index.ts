import { z } from "zod";
import { getConfig } from "../../utils/getConfig.js";
import { requestClient } from "../../utils/requestClient.js";
import { _parseError } from "../shared/helpers.js";
import { ToolName } from "../shared/types.js";
import { FetchChatMessages, FetchChatRoom } from "../shared/gql-queries.js";

const InputSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("Number of recent messages to fetch (default: 20, max: 100)"),
});

type Input = z.infer<typeof InputSchema>;

export const wopeeReadChatHistory = {
  name: ToolName.WOPEE_READ_CHAT_HISTORY,
  config: {
    title: "Read chat history",
    description:
      "Read recent messages from the current project's chat room. Returns the last N messages in chronological order, including sender info and timestamps. Use this to understand the conversation context or review what has been discussed. Requires WOPEE_PROJECT_UUID to be configured.",
    inputSchema: InputSchema.shape,
  },
  handler: async (input: Input) => {
    try {
      const { WOPEE_PROJECT_UUID } = getConfig();

      if (!WOPEE_PROJECT_UUID)
        return {
          content: [
            { type: "text" as const, text: "WOPEE_PROJECT_UUID is not set" },
          ],
        };

      // First fetch the chat room for this project
      const roomResult = await requestClient<{
        fetchChatRoom: { uuid: string } | null;
      }>(FetchChatRoom, {
        projectUuid: WOPEE_PROJECT_UUID,
      });

      if (!roomResult?.fetchChatRoom)
        return {
          content: [
            {
              type: "text" as const,
              text: "No chat room found for this project",
            },
          ],
        };

      const result = await requestClient<{
        fetchChatMessages: Array<{
          uuid: string;
          authorType: string;
          authorName: string | null;
          content: string;
          contentType: string;
          sourcePlatform: string;
          createdAt: string;
        }>;
      }>(FetchChatMessages, {
        roomUuid: roomResult.fetchChatRoom.uuid,
        limit: input.limit,
      });

      const messages = result?.fetchChatMessages || [];
      if (messages.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No messages found in the chat room",
            },
          ],
        };
      }

      const formatted = messages
        .map((msg) => {
          const author = msg.authorName || msg.authorType;
          const time = new Date(msg.createdAt).toISOString();
          return `[${time}] ${author}: ${msg.content}`;
        })
        .join("\n");

      return {
        content: [
          {
            type: "text" as const,
            text: `Chat history (${messages.length} messages):\n\n${formatted}`,
          },
        ],
      };
    } catch (error) {
      return _parseError(error);
    }
  },
};
