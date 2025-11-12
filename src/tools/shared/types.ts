export enum ToolName {
  WOPEE_FETCH_ANALYSIS_SUITES = "wopee_fetch_analysis_suites",

  WOPEE_DISPATCH_ANALYSIS = "wopee_dispatch_analysis",
  WOPEE_DISPATCH_AGENT = "wopee_dispatch_agent",

  WOPEE_FETCH_FILE = "wopee_fetch_file",
  WOPEE_UPDATE_FILE = "wopee_update_file",
  WOPEE_GENERATE_FILE = "wopee_generate_file",
}

export const Bucket = {
  APP_CONTEXT: "project-suite-app-context",
  GENERAL_USER_STORIES: "project-suite-general-user-stories",
  USER_STORIES: "project-suite-user-stories",
  PAGE_CONTENT: "screen-instance-page-content",
  PROMPTS: "project-prompts",
  PLAYWRIGHT_CODE: "project-suite-playwright-code",
  UPLOADED_PAGE_DATA: "project-uploaded-page-data",
} as const;

export enum FileType {
  APP_CONTEXT = "APP_CONTEXT",
  GENERAL_USER_STORIES = "GENERAL_USER_STORIES",
  USER_STORIES = "USER_STORIES",
  TEST_CASES = "TEST_CASES",
}

export enum SuiteType {
  BOT = "BOT",
  CODE = "CODE",
  AGENT = "AGENT",
  ANALYSIS = "ANALYSIS",
  INTEGRATION = "INTEGRATION",
  UPLOADED_PAGE_DATA = "UPLOADED_PAGE_DATA",
}

export enum SuiteRunningStatus {
  IDLE = "IDLE",
  FINISHED = "FINISHED",
  IN_PROGRESS = "IN_PROGRESS",
  IN_PROGRESS_MERGE = "IN_PROGRESS_MERGE",
}

export enum ExecutionStatus {
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
  FAILED = "FAILED",
}

export enum GenerationStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_QUEUE = "IN_QUEUE",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
  FAILED = "FAILED",
}

type GenerationState = {
  uuid: string;
  isGenerated: boolean;
  status: GenerationStatus;
};

type GeneratedAnalysisDataState = {
  uuid: string;
  suiteUuid: string;
  appContext: GenerationState;
  generalUserStories: GenerationState;
  userStories: GenerationState;
  testCases: GenerationState;
};

export type AnalysisSuite = {
  uuid: string;
  name: string | null;
  suiteType: SuiteType | null;
  executionStatus: ExecutionStatus | null;
  analysisIdentifier: string | null;
  suiteRunningStatus: SuiteRunningStatus | null;
  createdAt: string;
  updatedAt: string;
  generatedAnalysisDataState: GeneratedAnalysisDataState | null;
};
