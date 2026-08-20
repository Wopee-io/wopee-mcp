export enum ToolName {
  WOPEE_CREATE_BLANK_SUITE = "wopee_create_blank_suite",
  WOPEE_FETCH_ANALYSIS_SUITES = "wopee_fetch_analysis_suites",
  WOPEE_FETCH_EXECUTED_TEST_CASES = "wopee_fetch_executed_test_cases",
  WOPEE_FETCH_RECENT_EXECUTIONS = "wopee_fetch_recent_executions",
  WOPEE_FETCH_TEST_INVENTORY = "wopee_fetch_test_inventory",

  WOPEE_DISPATCH_ANALYSIS = "wopee_dispatch_analysis",
  WOPEE_DISPATCH_AGENT = "wopee_dispatch_agent",

  WOPEE_FETCH_ARTIFACT = "wopee_fetch_artifact",
  WOPEE_UPDATE_ARTIFACT = "wopee_update_artifact",
  WOPEE_GENERATE_ARTIFACT = "wopee_generate_artifact",

  WOPEE_SEND_CHAT_MESSAGE = "wopee_send_chat_message",
  WOPEE_READ_CHAT_HISTORY = "wopee_read_chat_history",
  WOPEE_CREATE_GITHUB_ISSUE = "wopee_create_github_issue",

  WOPEE_FETCH_VARIABLES = "wopee_fetch_variables",
  WOPEE_UPDATE_VARIABLES = "wopee_update_variables",
}

export enum VariableLevel {
  PROJECT = "PROJECT",
  ANALYSIS = "ANALYSIS",
}

export enum GenerateArtifactType {
  APP_CONTEXT = "APP_CONTEXT",
  GENERAL_USER_STORIES = "GENERAL_USER_STORIES",
  USER_STORIES_WITH_TEST_CASES = "USER_STORIES_WITH_TEST_CASES",
  TEST_CASES = "TEST_CASES",
  TEST_CASE_STEPS = "TEST_CASE_STEPS",
  REUSABLE_TEST_CASES = "REUSABLE_TEST_CASES",
  REUSABLE_TEST_CASE_STEPS = "REUSABLE_TEST_CASE_STEPS",
}

export enum ArtifactType {
  APP_CONTEXT = "APP_CONTEXT",
  GENERAL_USER_STORIES = "GENERAL_USER_STORIES",
  USER_STORIES = "USER_STORIES",
  PLAYWRIGHT_CODE = "PLAYWRIGHT_CODE",
  PROJECT_CONTEXT = "PROJECT_CONTEXT",
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
  reusableTestCases: GenerationState;
  testCaseSteps: string[];
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

export enum ReportStatus {
  PASSED = "PASSED",
  FAILED = "FAILED",
}

export type ExecutedTestCase = {
  uuid: string;
  projectUuid: string;
  suiteUuid: string;
  analysisSuiteUuid: string;
  analysisIdentifier: string;
  userStoryId: string;
  testCaseId: string;
  /** Exact GitHub Actions run title for this execution, stored at dispatch (backlog#4382). */
  runName: string | null;
  executionStatus: ExecutionStatus;
  agentReport: string | null;
  agentReportStatus: ReportStatus | null;
  codeReport: string | null;
  codeReportStatus: ReportStatus | null;
  createdAt: string;
  updatedAt: string;
};

export type FetchExecutedTestCasesResponse = {
  userStoryId: string;
  executedTestCases: ExecutedTestCase[];
};
