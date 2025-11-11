import {
  FetchFileHandlerInput,
  FetchFileHandlerInputSchema,
} from "../shared/schemas.js";
import { fetchFile } from "../shared/handlers.js";
import { Bucket, ToolName } from "../shared/types.js";

export const wopeeFetchTestCases = {
  name: ToolName.WOPEE_FETCH_TEST_CASES,
  config: {
    title: "Fetch test cases",
    description: "Fetch suite's test cases JSON file for selected project",
    inputSchema: FetchFileHandlerInputSchema.shape,
  },
  handler: async (input: FetchFileHandlerInput) =>
    await fetchFile({
      ...input,
      bucket: Bucket.USER_STORIES,
    }),
};
