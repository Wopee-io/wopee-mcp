import { z } from "zod";
import { ArtifactType, GenerateArtifactType } from "./types.js";

enum CookiesPreference {
  ACCEPT_ALL = "ACCEPT_ALL",
  DECLINE_ALL = "DECLINE_ALL",
  IGNORE = "IGNORE",
}

export const SuiteAnalysisConfigSchema = z.object({
  startingUrl: z.string().nullable().default(null),
  username: z.string().nullable().default(null),
  password: z.string().nullable().default(null),
  cookiesPreference: z.nativeEnum(CookiesPreference).nullable().default(null),
  additionalInstructions: z.string().nullable().default(null),
  additionalVariables: z.string().nullable().default(null),
});

// Shared by wopee_dispatch_analysis and wopee_update_variables. Keys must be
// uppercase (server enforces the same EnvVarKeyRegex on write).
export const AdditionalVariableSchema = z.object({
  key: z
    .string({
      description:
        "Variable name. Must be uppercase with underscores only (e.g. MY_VAR, BASE_URL).",
    })
    .regex(
      /^[A-Z_][A-Z0-9_]*$/,
      "Key must be uppercase alphanumeric with underscores, starting with a letter or underscore",
    ),
  value: z
    .string({ description: "Variable value. Must be a non-empty string." })
    .min(1, "Value must be a non-empty string"),
});

export const GenerateAIDataHandlerInputSchema = z.object({
  type: z.nativeEnum(GenerateArtifactType, {
    description:
      "Type of test artifact to generate. One of: APP_CONTEXT, GENERAL_USER_STORIES, USER_STORIES_WITH_TEST_CASES, TEST_CASES, TEST_CASE_STEPS, REUSABLE_TEST_CASES, REUSABLE_TEST_CASE_STEPS. Start with APP_CONTEXT, then generate stories and test cases from it.",
  }),
  suiteUuid: z
    .string({
      description:
        "UUID of the analysis suite to generate artifacts for. Get this from wopee_create_blank_suite or wopee_fetch_analysis_suites.",
    })
    .min(1, "Suite UUID is required"),
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
});

export const FetchArtifactHandlerInputSchema = z.object({
  type: z.nativeEnum(ArtifactType, {
    description:
      "Type of test artifact to retrieve. One of: APP_CONTEXT (application description), GENERAL_USER_STORIES (stories without test cases), USER_STORIES (stories with test cases), PLAYWRIGHT_CODE (generated test code — requires identifier), PROJECT_CONTEXT (project-level context).",
  }),
  suiteUuid: z
    .string({
      description:
        "UUID of the analysis suite to fetch artifacts from. Get this from wopee_fetch_analysis_suites.",
    })
    .min(1, "Suite UUID is required"),
  identifier: z
    .string({
      description:
        "Test case identifier in format 'US004:TC006'. Required only when type is PLAYWRIGHT_CODE. Ignored for all other artifact types.",
    })
    .optional(),
});

export const FetchArtifactFactoryInputSchema = z.object({
  suiteUuid: z.string().min(1, "Suite UUID is required"),
  type: z.nativeEnum(ArtifactType),
  identifier: z
    .string({
      description:
        "Identifier for the test case to fetch playwright code for, ex. `US004:TC006`, should be provided only for `PLAYWRIGHT_CODE` artifact type",
    })
    .nullish(),
});

export const FetchArtifactInputSchema = z.object({
  projectUuid: z.string().min(1, "Project UUID is required"),
  suiteUuid: z.string().min(1, "Suite UUID is required"),
  type: z.nativeEnum(ArtifactType),
  identifier: z
    .string({
      description:
        "Identifier for the test case to fetch playwright code for, ex. `US004:TC006`, should be provided only for `PLAYWRIGHT_CODE` artifact type",
    })
    .nullish(),
  ref: z.string().nullish(), // branch, tag or commit sha
});

export const UpdateArtifactHandlerInputSchema = z.object({
  type: z.nativeEnum(ArtifactType, {
    description:
      "Type of test artifact to update. One of: APP_CONTEXT, GENERAL_USER_STORIES, USER_STORIES, PLAYWRIGHT_CODE (requires identifier), PROJECT_CONTEXT. Must match the type used when the artifact was generated.",
  }),
  content: z.string({
    description:
      "The complete new content to replace the existing artifact. This is a destructive overwrite — the entire previous content is replaced. Pass the full updated content, not a partial diff.",
  }),
  suiteUuid: z
    .string({
      description:
        "UUID of the analysis suite containing the artifact to update. Get this from wopee_fetch_analysis_suites.",
    })
    .min(1, "Suite UUID is required"),
  identifier: z
    .string({
      description:
        "Test case identifier in format 'US004:TC006'. Required only when type is PLAYWRIGHT_CODE. Ignored for all other artifact types.",
    })
    .optional(),
});

export const UpdateArtifactFactoryInputSchema = z.object({
  type: z.nativeEnum(ArtifactType),
  suiteUuid: z.string().min(1, "Suite UUID is required"),
  content: z.string(),
  identifier: z.string().optional(),
});

export const UpdateArtifactInputSchema = z.object({
  projectUuid: z.string().min(1, "Project UUID is required"),
  suiteUuid: z.string().min(1, "Suite UUID is required"),
  type: z.nativeEnum(ArtifactType),
  identifier: z
    .string({
      description:
        "Identifier for the test case to update playwright code for, ex. `US004:TC006`, should be provided only for `PLAYWRIGHT_CODE` artifact type",
    })
    .nullish(),
  content: z.string({
    description: "Content of the artifact to update",
  }),
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
