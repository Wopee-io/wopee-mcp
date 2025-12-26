import {
  FetchArtifactHandlerInput,
  FetchArtifactHandlerInputSchema,
} from "../shared/schemas.js";
import { ToolName } from "../shared/types.js";
import { fetchArtifact } from "../shared/handlers.js";

export const wopeeFetchArtifact = {
  name: ToolName.WOPEE_FETCH_ARTIFACT,
  config: {
    title: "Fetch file(artifact)",
    description: "Fetch suite's file(artifact) for selected project",
    inputSchema: FetchArtifactHandlerInputSchema.shape,
  },
  handler: async (input: FetchArtifactHandlerInput) =>
    await fetchArtifact(input),
};
