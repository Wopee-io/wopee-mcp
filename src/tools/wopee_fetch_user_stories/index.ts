import {
  FetchFileHandlerInput,
  FetchFileHandlerInputSchema,
} from "../shared/schemas.js";
import { fetchFile } from "../shared/handlers.js";
import { Bucket, ToolName } from "../shared/types.js";

export const wopeeFetchUserStories = {
  name: ToolName.WOPEE_FETCH_USER_STORIES,
  config: {
    title: "Fetch user stories",
    description: "Fetch suite's user stories JSON file for selected project",
    inputSchema: FetchFileHandlerInputSchema.shape,
  },
  handler: async (input: FetchFileHandlerInput) =>
    await fetchFile({
      ...input,
      bucket: Bucket.USER_STORIES,
    }),
};
