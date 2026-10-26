// What a wopee_generate_artifact call asks the api for, beyond the suite it names.
//
// Imports are type-only so this module has no runtime dependencies (keeps it trivially
// unit-testable via node:test without module resolution).
import type { GenerateAIDataHandlerInput } from "../shared/schemas.js";
import type { GenerateArtifactType } from "../shared/types.js";

const TEST_CASES = "TEST_CASES" as GenerateArtifactType;

/** The generations the api can queue and answer at once; every other one always waits. */
const QUEUEABLE_TYPES = [
  TEST_CASES,
  "USER_STORIES_WITH_TEST_CASES" as GenerateArtifactType,
];

/** Whether this request is answered as soon as the api has queued it. */
export const isQueuedGeneration = (input: GenerateAIDataHandlerInput) =>
  input.async === true && QUEUEABLE_TYPES.includes(input.type);

/** An empty scope means every story or test case, which the api reads as null. */
const scope = (ids: string[] | undefined) =>
  ids && ids.length > 0 ? ids : null;

export const generationOptions = (input: GenerateAIDataHandlerInput) => ({
  extraPrompt: input.instructions?.trim() || null,
  selectedUserStories: scope(input.selectedUserStories),
  selectedTestCases: scope(input.selectedTestCases),
  // Sent on every test case generation, never left to the api's default: CREATE is the one mode
  // that deletes work, and an older api treats a missing mode as CREATE.
  ...(input.type === TEST_CASES ? { mode: input.mode } : {}),
  ...(isQueuedGeneration(input) ? { async: true } : {}),
});
