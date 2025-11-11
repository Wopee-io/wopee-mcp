import {
  FetchFileHandlerInput,
  FetchFileHandlerInputSchema,
} from "../shared/schemas.js";
import { fetchFile } from "../shared/handlers.js";
import { Bucket, ToolName } from "../shared/types.js";

export const wopeeFetchGeneralUserStories = {
  name: ToolName.WOPEE_FETCH_GENERAL_USER_STORIES,
  config: {
    title: "Fetch general user stories",
    description:
      "Fetch suite's general user stories markdown file for selected project",
    inputSchema: FetchFileHandlerInputSchema.shape,
  },
  handler: async (input: FetchFileHandlerInput) =>
    await fetchFile({
      ...input,
      bucket: Bucket.GENERAL_USER_STORIES,
    }),
};
