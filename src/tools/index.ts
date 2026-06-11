import { wopeeFetchArtifact } from "./wopee_fetch_artifact/index.js";
import { wopeeUpdateArtifact } from "./wopee_update_artifact/index.js";
import { wopeeGenerateArtifact } from "./wopee_generate_artifact/index.js";
import { wopeeDispatchAgent } from "./wopee_dispatch_agent/index.js";
import { wopeeDispatchAnalysis } from "./wopee_dispatch_analysis/index.js";
import { wopeeCreateBlankSuite } from "./wopee_create_blank_suite/index.js";
import { wopeeFetchAnalysisSuites } from "./wopee_fetch_analysis_suites/index.js";
import { wopeeFetchExecutedTestCases } from "./wopee_fetch_executed_test_cases/index.js";
import { wopeeFetchRecentExecutions } from "./wopee_fetch_recent_executions/index.js";
import { wopeeSendChatMessage } from "./wopee_send_chat_message/index.js";
import { wopeeReadChatHistory } from "./wopee_read_chat_history/index.js";
import { wopeeCreateGithubIssue } from "./wopee_create_github_issue/index.js";

export const TOOLS = [
  wopeeCreateBlankSuite,
  wopeeFetchAnalysisSuites,
  wopeeFetchExecutedTestCases,
  wopeeFetchRecentExecutions,

  wopeeDispatchAnalysis,
  wopeeDispatchAgent,

  wopeeFetchArtifact,
  wopeeUpdateArtifact,
  wopeeGenerateArtifact,

  wopeeSendChatMessage,
  wopeeReadChatHistory,
  wopeeCreateGithubIssue,
];
