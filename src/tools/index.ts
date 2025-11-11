import { wopeeDispatchAgent } from "./wopee_dispatch_agent/index.js";
import { wopeeFetchTestCases } from "./wopee_fetch_test_cases/index.js";
import { wopeeFetchAppContext } from "./wopee_fetch_app_context/index.js";
import { wopeeDispatchAnalysis } from "./wopee_dispatch_analysis/index.js";
import { wopeeFetchUserStories } from "./wopee_fetch_user_stories/index.js";
import { wopeeGenerateTestCases } from "./wopee_generate_test_cases/index.js";
import { wopeeGenerateAppContext } from "./wopee_generate_app_context/index.js";
import { wopeeFetchAnalysisSuites } from "./wopee_fetch_analysis_suites/index.js";
import { wopeeGenerateUserStories } from "./wopee_generate_user_stories/index.js";
import { wopeeFetchGeneralUserStories } from "./wopee_fetch_general_user_stories/index.js";
import { wopeeGenerateGeneralUserStories } from "./wopee_generate_general_user_stories/index.js";

export const TOOLS = [
  wopeeDispatchAnalysis,
  wopeeDispatchAgent,

  wopeeGenerateAppContext,
  wopeeGenerateGeneralUserStories,
  wopeeGenerateUserStories,
  wopeeGenerateTestCases,

  wopeeFetchAnalysisSuites,
  wopeeFetchAppContext,
  wopeeFetchGeneralUserStories,
  wopeeFetchUserStories,
  wopeeFetchTestCases,
];
