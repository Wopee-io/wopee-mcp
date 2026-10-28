import { z } from "zod";
import {
  ArtifactType,
  GenerateArtifactType,
  TestCaseGenerationMode,
} from "./types.js";

enum CookiesPreference {
  ACCEPT_ALL = "ACCEPT_ALL",
  DECLINE_ALL = "DECLINE_ALL",
  IGNORE = "IGNORE",
}

export const SuiteAnalysisConfigSchema = z.object({
  startingUrl: z.string().nullable().default(null),
  username: z.string().nullable().default(null),
  password: z.string().nullable().default(null),
  cookiesPreference: z.enum(CookiesPreference).nullable().default(null),
  additionalInstructions: z.string().nullable().default(null),
  additionalVariables: z.string().nullable().default(null),
});

// Shared by wopee_dispatch_analysis and wopee_update_variables. Keys must be
// uppercase (server enforces the same EnvVarKeyRegex on write).
export const AdditionalVariableSchema = z.object({
  key: z
    .string()
    .regex(
      /^[A-Z_][A-Z0-9_]*$/,
      "Key must be uppercase alphanumeric with underscores, starting with a letter or underscore",
    )
    .describe(
      "Variable name. Must be uppercase with underscores only (e.g. MY_VAR, BASE_URL).",
    ),
  value: z
    .string()
    .min(1, "Value must be a non-empty string")
    .describe("Variable value. Must be a non-empty string."),
});

export const GenerateAIDataHandlerInputSchema = z.object({
  type: z
    .enum(GenerateArtifactType)
    .describe(
      "Type of test artifact to generate. One of: APP_CONTEXT, GENERAL_USER_STORIES, USER_STORIES_WITH_TEST_CASES, TEST_CASES, TEST_CASE_STEPS, REUSABLE_TEST_CASES, REUSABLE_TEST_CASE_STEPS. Start with APP_CONTEXT, then generate stories and test cases from it.",
    ),
  suiteUuid: z
    .string()
    .min(1, "Suite UUID is required")
    .describe(
      "UUID of the analysis suite to generate artifacts for. Get this from wopee_create_blank_suite or wopee_fetch_analysis_suites.",
    ),
  mode: z
    .enum(TestCaseGenerationMode)
    .default(TestCaseGenerationMode.UPDATE)
    .describe(
      "TEST_CASES only. UPDATE (default) keeps every existing test case with its steps and run history, and adds or changes test cases around them. CREATE replaces the test cases of the stories in scope — of the whole suite when selectedUserStories is empty — and deletes their steps, run history and Playwright code. Use CREATE only when the user explicitly asks to start over.",
    ),
  selectedUserStories: z
    .array(z.string())
    .optional()
    .describe(
      "User story ids to limit the generation to, e.g. ['US001', 'US003']. Leave empty for every story in the suite. Used by TEST_CASES and TEST_CASE_STEPS.",
    ),
  selectedTestCases: z
    .array(z.string())
    .optional()
    .describe(
      "Test case identifiers to limit TEST_CASE_STEPS to, e.g. ['US001:TC002']. Leave empty for every test case in scope. Regenerating steps replaces the steps those test cases have.",
    ),
  instructions: z
    .string()
    .optional()
    .describe(
      "What the user asked for, in their words, e.g. 'add a negative test for an expired card'. Passed to the AI engine as the change request; without it, UPDATE removes no test case.",
    ),
  async: z
    .boolean()
    .optional()
    .describe(
      "TEST_CASES and USER_STORIES_WITH_TEST_CASES only. true returns as soon as the generation is queued instead of waiting for it (a large suite can take several minutes); the content is then read later with wopee_fetch_artifact. Default false: wait and return the generated artifact.",
    ),
});

export const GenerateAIDataInputSchema = z.object({
  projectUuid: z.string().min(1, "Project UUID is required"),
  suiteUuid: z.string().min(1, "Suite UUID is required"),
  extraPrompt: z.string().nullish(),
  sourceSuiteUuid: z.string().nullish(),
  selectedUserStories: z.array(z.string()).nullish(), // ["US001", "US002", "US003"]
  selectedTestCases: z.array(z.string()).nullish(), // ["US001:TC001", "US003:TC002", "US015:TC033"]
  suiteAnalysisConfig: SuiteAnalysisConfigSchema,
  continueGeneration: z.boolean().nullish().default(false),
  mode: z.enum(TestCaseGenerationMode).nullish(),
  async: z.boolean().nullish(),
});

export const FetchArtifactHandlerInputSchema = z.object({
  type: z
    .enum(ArtifactType)
    .describe(
      "Type of test artifact to retrieve. One of: APP_CONTEXT (application description), GENERAL_USER_STORIES (stories without test cases), USER_STORIES (stories with test cases), PLAYWRIGHT_CODE (generated test code — requires identifier), PROJECT_CONTEXT (project-level context).",
    ),
  suiteUuid: z
    .string()
    .min(1, "Suite UUID is required")
    .describe(
      "UUID of the analysis suite to fetch artifacts from. Get this from wopee_fetch_analysis_suites.",
    ),
  identifier: z
    .string()
    .optional()
    .describe(
      "Test case identifier in format 'US004:TC006'. Required only when type is PLAYWRIGHT_CODE. Ignored for all other artifact types.",
    ),
});

export const FetchArtifactFactoryInputSchema = z.object({
  suiteUuid: z.string().min(1, "Suite UUID is required"),
  type: z.enum(ArtifactType),
  identifier: z
    .string()
    .nullish()
    .describe(
      "Identifier for the test case to fetch playwright code for, ex. `US004:TC006`, should be provided only for `PLAYWRIGHT_CODE` artifact type",
    ),
});

export const FetchArtifactInputSchema = z.object({
  projectUuid: z.string().min(1, "Project UUID is required"),
  suiteUuid: z.string().min(1, "Suite UUID is required"),
  type: z.enum(ArtifactType),
  identifier: z
    .string()
    .nullish()
    .describe(
      "Identifier for the test case to fetch playwright code for, ex. `US004:TC006`, should be provided only for `PLAYWRIGHT_CODE` artifact type",
    ),
  ref: z.string().nullish(), // branch, tag or commit sha
});

export const UpdateArtifactHandlerInputSchema = z.object({
  type: z
    .enum(ArtifactType)
    .describe(
      "Type of test artifact to update. One of: APP_CONTEXT, GENERAL_USER_STORIES, USER_STORIES, PLAYWRIGHT_CODE (requires identifier), PROJECT_CONTEXT. Must match the type used when the artifact was generated.",
    ),
  content: z
    .string()
    .describe(
      "The complete new content to replace the existing artifact. This is a destructive overwrite — the entire previous content is replaced. Pass the full updated content, not a partial diff.",
    ),
  suiteUuid: z
    .string()
    .min(1, "Suite UUID is required")
    .describe(
      "UUID of the analysis suite containing the artifact to update. Get this from wopee_fetch_analysis_suites.",
    ),
  identifier: z
    .string()
    .optional()
    .describe(
      "Test case identifier in format 'US004:TC006'. Required only when type is PLAYWRIGHT_CODE. Ignored for all other artifact types.",
    ),
});

export const UpdateArtifactFactoryInputSchema = z.object({
  type: z.enum(ArtifactType),
  suiteUuid: z.string().min(1, "Suite UUID is required"),
  content: z.string(),
  identifier: z.string().optional(),
});

export const UpdateArtifactInputSchema = z.object({
  projectUuid: z.string().min(1, "Project UUID is required"),
  suiteUuid: z.string().min(1, "Suite UUID is required"),
  type: z.enum(ArtifactType),
  identifier: z
    .string()
    .nullish()
    .describe(
      "Identifier for the test case to update playwright code for, ex. `US004:TC006`, should be provided only for `PLAYWRIGHT_CODE` artifact type",
    ),
  content: z.string().describe("Content of the artifact to update"),
});

export type GenerateAIDataHandlerInput = z.infer<
  typeof GenerateAIDataHandlerInputSchema
>;
export type GenerateAIDataInput = z.infer<typeof GenerateAIDataInputSchema>;
export type FetchArtifactHandlerInput = z.infer<
  typeof FetchArtifactHandlerInputSchema
>;
export type FetchArtifactInput = z.infer<typeof FetchArtifactInputSchema>;
export type FetchArtifactFactoryInput = z.infer<
  typeof FetchArtifactFactoryInputSchema
>;
export type UpdateArtifactHandlerInput = z.infer<
  typeof UpdateArtifactHandlerInputSchema
>;
export type UpdateArtifactFactoryInput = z.infer<
  typeof UpdateArtifactFactoryInputSchema
>;
export type UpdateArtifactInput = z.infer<typeof UpdateArtifactInputSchema>;
