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

export const GenerateAIDataHandlerInputSchema = z.object({
  type: z.nativeEnum(GenerateArtifactType, {
    description: "Chosen type of file(artifact) to generate",
  }),
  suiteUuid: z
    .string({ description: "UUID of the suite to generate file(artifact) for" })
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
    description: "Chosen file(artifact) to fetch",
  }),
  suiteUuid: z
    .string({ description: "UUID of the suite to fetch the file from" })
    .min(1, "Suite UUID is required"),
  identifier: z
    .string({
      description:
        "Identifier for the test case to fetch playwright code for, ex. `US004:TC006`, should be provided only for `PLAYWRIGHT_CODE` artifact type",
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
    description: "Chosen file(artifact) to update",
  }),
  content: z.string({
    description: "Content of the file(artifact) to update",
  }),
  suiteUuid: z
    .string({ description: "UUID of the suite to update the file for" })
    .min(1, "Suite UUID is required"),
  identifier: z
    .string({
      description:
        "Identifier for the test case to update playwright code for, ex. `US004:TC006`, should be provided only for `PLAYWRIGHT_CODE` artifact type",
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
