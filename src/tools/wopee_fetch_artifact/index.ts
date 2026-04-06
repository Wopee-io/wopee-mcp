import {
  FetchArtifactHandlerInput,
  FetchArtifactHandlerInputSchema,
} from "../shared/schemas.js";
import { ToolName } from "../shared/types.js";
import { fetchArtifact } from "../shared/handlers.js";

export const wopeeFetchArtifact = {
  name: ToolName.WOPEE_FETCH_ARTIFACT,
  config: {
    title: "Fetch test artifacts",
    description:
      "Retrieve a specific test artifact from a suite. Returns the artifact content as text. Use this to review what wopee_generate_artifact created, or to retrieve existing artifacts before editing with wopee_update_artifact. Does NOT modify any data — this is a read-only operation. If the requested artifact type has not been generated yet for this suite, returns an empty result. For PLAYWRIGHT_CODE, you must provide the test case identifier (e.g. 'US004:TC006'); omitting it returns an error. For all other types, the identifier parameter is ignored.",
    inputSchema: FetchArtifactHandlerInputSchema.shape,
  },
  handler: async (input: FetchArtifactHandlerInput) =>
    await fetchArtifact(input),
};
