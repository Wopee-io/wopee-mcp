import {
  UpdateArtifactHandlerInput,
  UpdateArtifactHandlerInputSchema,
} from "../shared/schemas.js";
import { ToolName } from "../shared/types.js";
import { updateArtifact } from "../shared/handlers.js";

export const wopeeUpdateArtifact = {
  name: ToolName.WOPEE_UPDATE_ARTIFACT,
  config: {
    title: "Update file",
    description: "Update file(artifact) in the project",
    inputSchema: UpdateArtifactHandlerInputSchema.shape,
  },
  handler: async (input: UpdateArtifactHandlerInput) =>
    await updateArtifact(input),
};
