import { wopeeFetchFile } from "./wopee_fetch_file/index.js";
import { wopeeUpdateFile } from "./wopee_update_file/index.js";
import { wopeeGenerateFile } from "./wopee_generate_file/index.js";
import { wopeeDispatchAgent } from "./wopee_dispatch_agent/index.js";
import { wopeeDispatchAnalysis } from "./wopee_dispatch_analysis/index.js";
import { wopeeFetchAnalysisSuites } from "./wopee_fetch_analysis_suites/index.js";

export const TOOLS = [
  wopeeFetchAnalysisSuites,

  wopeeDispatchAnalysis,
  wopeeDispatchAgent,

  wopeeFetchFile,
  wopeeUpdateFile,
  wopeeGenerateFile,
];
