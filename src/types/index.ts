import { z } from 'zod';

/**
 * Configuration schema for Wopee API
 */
export const WopeeConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  apiUrl: z.string().url('Invalid API URL').default('https://api.wopee.io/'),
  projectUuid: z.string().min(1, 'Project UUID is required'),
});

export type WopeeConfig = z.infer<typeof WopeeConfigSchema>;

/**
 * GraphQL response types
 */
export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
  }>;
}

/**
 * API Enums
 */
export enum CookiesPreference {
  ACCEPT_ALL = 'ACCEPT_ALL',
  DECLINE_ALL = 'DECLINE_ALL',
  IGNORE = 'IGNORE'
}

export enum RerunMode {
  FULL = 'FULL',
  CRAWLING = 'CRAWLING'
}

export enum SuiteType {
  BOT = 'BOT',
  CODE = 'CODE',
  AGENT = 'AGENT',
  ANALYSIS = 'ANALYSIS',
  INTEGRATION = 'INTEGRATION',
  UPLOADED_PAGE_DATA = 'UPLOADED_PAGE_DATA'
}

export enum SuiteRunningStatus {
  IDLE = 'IDLE',
  FINISHED = 'FINISHED',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_PROGRESS_MERGE = 'IN_PROGRESS_MERGE'
}

export enum GeneratedAnalysisDataState {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum UploadStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED'
}

export enum ExecutionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED'
}

export enum GenerationStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_QUEUE = 'IN_QUEUE',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED'
}

/**
 * API Input Types
 */
export const SuiteAnalysisConfigInputSchema = z.object({
  startingUrl: z.string().url('Invalid starting URL').optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  cookiesPreference: z.nativeEnum(CookiesPreference).optional(),
  additionalInstructions: z.string().optional(),
  additionalVariables: z.string().optional(),
});

export const RerunOptionsSchema = z.object({
  suiteUuid: z.string().min(1, 'Suite UUID is required'),
  analysisIdentifier: z.string().min(1, 'Analysis identifier is required'),
  mode: z.nativeEnum(RerunMode),
});

export const SelectedTestCasesInputSchema = z.object({
  testCaseId: z.string().min(1, 'Test case ID is required'),
  userStoryId: z.string().min(1, 'User story ID is required'),
});

/**
 * Tool parameter schemas
 */
export const DispatchAnalysisSchema = z.object({
  projectUuid: z.string().min(1, 'Project UUID is required'),
  iterations: z.number().int().positive().optional(),
  suiteAnalysisConfig: SuiteAnalysisConfigInputSchema.optional(),
  rerun: RerunOptionsSchema.optional(),
});

export const DispatchAgentSchema = z.object({
  projectUuid: z.string().min(1, 'Project UUID is required'),
  suiteUuid: z.string().min(1, 'Suite UUID is required'),
  analysisIdentifier: z.string().min(1, 'Analysis identifier is required'),
  testCases: z.array(SelectedTestCasesInputSchema).optional(),
  skipRateLimitCheck: z.boolean().optional(),
});

export const GenerateAIDataSchema = z.object({
  projectUuid: z.string().min(1, 'Project UUID is required'),
  suiteUuid: z.string().min(1, 'Suite UUID is required'),
  extraPrompt: z.string().optional(),
  selectedUserStories: z.array(z.string()).optional(),
  suiteAnalysisConfig: SuiteAnalysisConfigInputSchema.optional(),
  continueGeneration: z.boolean().optional(),
});

export const FetchFileSchema = z.object({
  projectUuid: z.string().min(1, 'Project UUID is required'),
  suiteUuid: z.string().min(1, 'Suite UUID is required'),
  bucket: z.string().min(1, 'Bucket is required'),
});

// New fetch tool schemas
export const GetAppContextSchema = z.object({
  projectUuid: z.string().min(1, 'Project UUID is required'),
  suiteUuid: z.string().min(1, 'Suite UUID is required'),
});

export const GetUserStoriesSchema = z.object({
  projectUuid: z.string().min(1, 'Project UUID is required'),
  suiteUuid: z.string().min(1, 'Suite UUID is required'),
});

export const GetTestCasesSchema = z.object({
  projectUuid: z.string().min(1, 'Project UUID is required'),
  suiteUuid: z.string().min(1, 'Suite UUID is required'),
});

export const FetchAnalysisSuitesSchema = z.object({
  projectUuid: z.string().min(1, 'Project UUID is required'),
});

export type SuiteAnalysisConfigInput = z.infer<typeof SuiteAnalysisConfigInputSchema>;
export type RerunOptions = z.infer<typeof RerunOptionsSchema>;
export type SelectedTestCasesInput = z.infer<typeof SelectedTestCasesInputSchema>;

export type DispatchAnalysisParams = z.infer<typeof DispatchAnalysisSchema>;
export type DispatchAgentParams = z.infer<typeof DispatchAgentSchema>;
export type GenerateAIDataParams = z.infer<typeof GenerateAIDataSchema>;
export type FetchFileParams = z.infer<typeof FetchFileSchema>;

// New fetch tool parameter types
export type GetAppContextParams = z.infer<typeof GetAppContextSchema>;
export type GetUserStoriesParams = z.infer<typeof GetUserStoriesSchema>;
export type GetTestCasesParams = z.infer<typeof GetTestCasesSchema>;
export type FetchAnalysisSuitesParams = z.infer<typeof FetchAnalysisSuitesSchema>;

/**
 * Bucket constants for data fetching
 */
export const Bucket = {
  APP_CONTEXT: "project-suite-app-context",
  GENERAL_USER_STORIES: "project-suite-general-user-stories",
  USER_STORIES: "project-suite-user-stories",
  PAGE_CONTENT: "screen-instance-page-content",
  PROMPTS: "project-prompts",
  PLAYWRIGHT_CODE: "project-suite-playwright-code",
  UPLOADED_PAGE_DATA: "project-uploaded-page-data",
} as const;

/**
 * Tool result types
 */
export interface ToolResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Analysis result type
 */
export interface AnalysisSuiteR {
  uuid: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
  suiteType?: SuiteType;
  analysisIdentifier: string;
  suiteRunningStatus: SuiteRunningStatus;
  generatedAnalysisDataState: GeneratedAnalysisDataState;
}

/**
 * Generation state type
 */
export interface GenerationState {
  uuid: string;
  isGenerated: boolean;
  status: GenerationStatus;
}

/**
 * Generated analysis data state type
 */
export interface GeneratedAnalysisDataStateType {
  uuid: string;
  suiteUuid?: string;
  appContext?: GenerationState;
  generalUserStories?: GenerationState;
  userStories?: GenerationState;
  testCases?: GenerationState;
}

/**
 * Fetch analysis suite response type
 */
export interface FetchAnalysisSuiteResponse {
  uuid: string;
  name?: string;
  suiteType?: SuiteType;
  uploadStatus?: UploadStatus;
  executionStatus?: ExecutionStatus;
  analysisIdentifier?: string;
  suiteRunningStatus?: SuiteRunningStatus;
  createdAt: string;
  updatedAt: string;
  generatedAnalysisDataState?: GeneratedAnalysisDataStateType;
}

/**
 * Test result type
 */
export interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  steps?: Array<{
    name: string;
    status: 'passed' | 'failed' | 'skipped';
    error?: string;
  }>;
}
