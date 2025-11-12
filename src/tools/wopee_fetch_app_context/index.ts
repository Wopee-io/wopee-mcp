import {
  FetchFileHandlerInput,
  FetchFileHandlerInputSchema,
} from "../shared/schemas.js";
import { fetchFile } from "../shared/handlers.js";
import { Bucket, ToolName } from "../shared/types.js";

export const wopeeFetchAppContext = {
  name: ToolName.WOPEE_FETCH_APP_CONTEXT,
  config: {
    title: "Fetch app context",
    description:
      "Fetch suite's application context markdown file for selected project",
    inputSchema: FetchFileHandlerInputSchema.shape,
  },
  handler: async (input: FetchFileHandlerInput) =>
    await fetchFile({
      ...input,
      bucket: Bucket.APP_CONTEXT,
    }),
};
