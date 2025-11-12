import {
  UpdateFileHandlerInput,
  UpdateFileHandlerInputSchema,
} from "../shared/schemas.js";
import { ToolName } from "../shared/types.js";
import { updateFile } from "../shared/handlers.js";

export const wopeeUpdateFile = {
  name: ToolName.WOPEE_UPDATE_FILE,
  config: {
    title: "Update file",
    description: "Update file(artifact) in the project",
    inputSchema: UpdateFileHandlerInputSchema.shape,
  },
  handler: async (input: UpdateFileHandlerInput) => await updateFile(input),
};
