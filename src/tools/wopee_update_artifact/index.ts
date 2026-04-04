import {
  UpdateArtifactHandlerInput,
  UpdateArtifactHandlerInputSchema,
} from "../shared/schemas.js";
import { ToolName } from "../shared/types.js";
import { updateArtifact } from "../shared/handlers.js";

export const wopeeUpdateArtifact = {
  name: ToolName.WOPEE_UPDATE_ARTIFACT,
  config: {
    title: "Update test artifacts",
    description:
      "Update previously generated content in a suite. Use this to refine user stories, test cases, app context, or Playwright code after reviewing them with wopee_fetch_artifact. Requires the content type (APP_CONTEXT, GENERAL_USER_STORIES, USER_STORIES, PLAYWRIGHT_CODE, or PROJECT_CONTEXT), the suite UUID, and the new content as a string. For PLAYWRIGHT_CODE, also provide the test case identifier (e.g. 'US004:TC006'). This enables an iterative workflow: generate → review → update → dispatch.",
    inputSchema: UpdateArtifactHandlerInputSchema.shape,
  },
  handler: async (input: UpdateArtifactHandlerInput) =>
    await updateArtifact(input),
};
