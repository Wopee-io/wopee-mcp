import { z } from "zod";
import { Bucket, FileType } from "./types.js";

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
  fileType: z.nativeEnum(FileType, {
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

export const FetchFileHandlerInputSchema = z.object({
  fileType: z.nativeEnum(FileType, {
    description: "Chosen file(artifact) to fetch",
  }),
  suiteUuid: z
    .string({ description: "UUID of the suite to fetch the file from" })
    .min(1, "Suite UUID is required"),
});

export const FetchFileFactoryInputSchema = z.object({
  suiteUuid: z.string().min(1, "Suite UUID is required"),
  bucket: z.nativeEnum(Bucket),
});

export const FetchFileInputSchema = z.object({
  projectUuid: z.string().min(1, "Project UUID is required"),
  suiteUuid: z.string().min(1, "Suite UUID is required"),
  bucket: z.nativeEnum(Bucket),
});

export const UpdateFileHandlerInputSchema = z.object({
  fileType: z.nativeEnum(FileType, {
    description: "Chosen file(artifact) to update",
  }),
  fileContent: z.string({
    description: "Content of the file(artifact) to update",
  }),
  suiteUuid: z
    .string({ description: "UUID of the suite to update the file for" })
    .min(1, "Suite UUID is required"),
});

export const UpdateFileFactoryInputSchema = z.object({
  bucket: z.nativeEnum(Bucket),
  suiteUuid: z.string().min(1, "Suite UUID is required"),
  fileContent: z.string(),
  outputType: z.enum(["markdown", "json"]),
});

export const UpdateFileInputSchema = z.object({
  projectUuid: z.string().min(1, "Project UUID is required"),
  suiteUuid: z.string().min(1, "Suite UUID is required"),
  bucket: z.nativeEnum(Bucket),
  json: z.string().nullish(),
  code: z.string().nullish(),
});

export type GenerateAIDataHandlerInput = z.infer<
  typeof GenerateAIDataHandlerInputSchema
>;
export type GenerateAIDataInput = z.infer<typeof GenerateAIDataInputSchema>;
export type FetchFileHandlerInput = z.infer<typeof FetchFileHandlerInputSchema>;
export type FetchFileInput = z.infer<typeof FetchFileInputSchema>;
export type FetchFileFactoryInput = z.infer<typeof FetchFileFactoryInputSchema>;
export type UpdateFileHandlerInput = z.infer<
  typeof UpdateFileHandlerInputSchema
>;
export type UpdateFileFactoryInput = z.infer<
  typeof UpdateFileFactoryInputSchema
>;
export type UpdateFileInput = z.infer<typeof UpdateFileInputSchema>;
