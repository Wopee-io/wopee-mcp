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
      "Retrieve test artifacts from a suite. Supported types: APP_CONTEXT (application description), GENERAL_USER_STORIES (user stories without test cases), USER_STORIES (user stories with test cases), PLAYWRIGHT_CODE (Playwright test code for a specific test case — requires identifier like 'US004:TC006'), PROJECT_CONTEXT (project-level context). Use after wopee_generate_artifact to review test artifacts, or to retrieve existing artifacts for editing with wopee_update_artifact.",
    inputSchema: FetchArtifactHandlerInputSchema.shape,
  },
  handler: async (input: FetchArtifactHandlerInput) =>
    await fetchArtifact(input),
};
