import {
  FetchFileHandlerInput,
  FetchFileHandlerInputSchema,
} from "../shared/schemas.js";
import { ToolName } from "../shared/types.js";
import { fetchFile } from "../shared/handlers.js";

export const wopeeFetchFile = {
  name: ToolName.WOPEE_FETCH_FILE,
  config: {
    title: "Fetch file(artifact)",
    description: "Fetch suite's file(artifact) for selected project",
    inputSchema: FetchFileHandlerInputSchema.shape,
  },
  handler: async (input: FetchFileHandlerInput) => await fetchFile(input),
};
