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
      "Create or overwrite a test artifact in a suite with caller-supplied content. The full content is replaced, not patched. Use this to upload your own APP_CONTEXT (e.g. built from JIRA / Confluence), user stories, project context, or Playwright code, or to fix / refine an artifact previously authored by wopee_generate_artifact. Works on any suite, including freshly-created blank suites with no prior generation — the artifact does not need to exist beforehand. Use wopee_generate_artifact instead when you want the Wopee.io AI engine to author the content from scratch. On success, returns confirmation. On failure (e.g. invalid suite UUID, storage misconfiguration), returns an error message. Idempotent: calling with the same content multiple times produces the same result.",
    inputSchema: UpdateArtifactHandlerInputSchema.shape,
  },
  handler: async (input: UpdateArtifactHandlerInput) =>
    await updateArtifact(input),
};
