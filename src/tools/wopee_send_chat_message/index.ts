import { z } from "zod";
import { getConfig } from "../../utils/getConfig.js";
import { requestClient } from "../../utils/requestClient.js";
import { _parseError } from "../shared/helpers.js";
import { ToolName } from "../shared/types.js";
import { SendChatMessage, FetchChatRoom } from "../shared/gql-queries.js";

const InputSchema = z.object({
  content: z.string().describe("The message content to send to the chat room"),
  contentType: z
    .enum(["STATUS_UPDATE", "TEXT"])
    .default("TEXT")
    .describe(
      "The type of message: TEXT for regular messages, STATUS_UPDATE for status notifications",
    ),
});

type Input = z.infer<typeof InputSchema>;

export const wopeeSendChatMessage = {
  name: ToolName.WOPEE_SEND_CHAT_MESSAGE,
  config: {
    title: "Send chat message",
    description:
      "Send a message to the current project's chat room. Use this to post status updates (e.g., 'Test run started...', 'Analysis complete') or informational messages to the chat. The message will appear as a SYSTEM message in the chat room. Requires WOPEE_PROJECT_UUID to be configured.",
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

      await requestClient<{
        sendChatMessage: { uuid: string; content: string; createdAt: string };
      }>(SendChatMessage, {
        input: {
          roomUuid: roomResult.fetchChatRoom.uuid,
          content: input.content,
          contentType: input.contentType,
          sourcePlatform: "CMD",
          authorType: "SYSTEM",
        },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Message sent successfully to chat room.`,
          },
        ],
      };
    } catch (error) {
      return _parseError(error);
    }
  },
};
