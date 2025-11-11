export enum ToolName {
  WOPEE_DISPATCH_ANALYSIS = "wopee_dispatch_analysis",
  WOPEE_DISPATCH_AGENT = "wopee_dispatch_agent",

  WOPEE_FETCH_ANALYSIS_SUITES = "wopee_fetch_analysis_suites",
  WOPEE_FETCH_APP_CONTEXT = "wopee_fetch_app_context",
  WOPEE_FETCH_GENERAL_USER_STORIES = "wopee_fetch_general_user_stories",
  WOPEE_FETCH_USER_STORIES = "wopee_fetch_user_stories",
  WOPEE_FETCH_TEST_CASES = "wopee_fetch_test_cases",

  WOPEE_GENERATE_APP_CONTEXT = "wopee_generate_app_context",
  WOPEE_GENERATE_GENERAL_USER_STORIES = "wopee_generate_general_user_stories",
  WOPEE_GENERATE_USER_STORIES = "wopee_generate_user_stories",
  WOPEE_GENERATE_TEST_CASES = "wopee_generate_test_cases",
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

export enum GenerationType {
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
