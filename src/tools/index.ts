import { wopeeFetchArtifact } from "./wopee_fetch_artifact/index.js";
import { wopeeUpdateArtifact } from "./wopee_update_artifact/index.js";
import { wopeeGenerateArtifact } from "./wopee_generate_artifact/index.js";
import { wopeeDispatchAgent } from "./wopee_dispatch_agent/index.js";
import { wopeeDispatchAnalysis } from "./wopee_dispatch_analysis/index.js";
import { wopeeCreateBlankSuite } from "./wopee_create_blank_suite/index.js";
import { wopeeFetchAnalysisSuites } from "./wopee_fetch_analysis_suites/index.js";

export const TOOLS = [
  wopeeCreateBlankSuite,
  wopeeFetchAnalysisSuites,

  wopeeDispatchAnalysis,
  wopeeDispatchAgent,

  wopeeFetchArtifact,
  wopeeUpdateArtifact,
  wopeeGenerateArtifact,
];
