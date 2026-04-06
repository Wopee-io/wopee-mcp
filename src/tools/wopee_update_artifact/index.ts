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
      "Replace the content of a previously generated test artifact in a suite. This is a destructive overwrite — the full content is replaced, not patched. Use this after reviewing artifacts with wopee_fetch_artifact to fix incorrect user stories, refine test case steps, or edit generated Playwright code. Do NOT use this to create new artifacts — use wopee_generate_artifact instead. Prerequisite: the artifact must already exist (generated via wopee_generate_artifact). On success, returns confirmation. On failure (e.g. invalid suite UUID, missing artifact), returns an error message. Idempotent: calling with the same content multiple times produces the same result.",
    inputSchema: UpdateArtifactHandlerInputSchema.shape,
  },
  handler: async (input: UpdateArtifactHandlerInput) =>
    await updateArtifact(input),
};
