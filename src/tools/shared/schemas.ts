import { z } from "zod";
import { Bucket } from "./types.js";

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
  suiteUuid: z.string().min(1, "Suite UUID is required"),
});

export const GenerateAIDataInputSchema = z.object({
  projectUuid: z.string().min(1, "Project UUID is required"),
  suiteUuid: z.string().min(1, "Suite UUID is required"),
  extraPrompt: z.string().nullish(),
  sourceSuiteUuid: z.string().nullish(),
  selectedUserStories: z.array(z.string()).nullish(),
  suiteAnalysisConfig: SuiteAnalysisConfigSchema,
  continueGeneration: z.boolean().nullish().default(false),
});

export const FetchFileHandlerInputSchema = z.object({
  suiteUuid: z.string().min(1, "Suite UUID is required"),
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

export type GenerateAIDataHandlerInput = z.infer<
  typeof GenerateAIDataHandlerInputSchema
>;
export type GenerateAIDataInput = z.infer<typeof GenerateAIDataInputSchema>;
export type FetchFileHandlerInput = z.infer<typeof FetchFileHandlerInputSchema>;
export type FetchFileInput = z.infer<typeof FetchFileInputSchema>;
export type FetchFileFactoryInput = z.infer<typeof FetchFileFactoryInputSchema>;
