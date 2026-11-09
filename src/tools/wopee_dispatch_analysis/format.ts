// The text an MCP caller reads back after dispatching an analysis — its handle to follow the crawl.
//
// Type-only imports keep this module loadable under `node --test` (strip-only mode).
import type { AnalysisSuite } from "../shared/types.js";

export function formatAnalysisDispatched(suite: AnalysisSuite): string {
  return [
    "ANALYSIS DISPATCHED — the crawl is RUNNING (not yet finished).",
    "",
    "Tracking:",
    `- Suite UUID: ${suite.uuid}`,
    `- Analysis Identifier: ${suite.analysisIdentifier ?? "N/A"}`,
    `- Status: ${suite.suiteRunningStatus ?? "N/A"}`,
    ...(suite.name ? [`- Name: ${suite.name}`] : []),
    "",
    "Poll wopee_fetch_analysis_suites every 30-60 s and find this Suite UUID; expect 5-10 minutes.",
    "The analysis is done when its suiteRunningStatus is no longer IN_PROGRESS and its user stories and test cases show as generated. Do not dispatch it again meanwhile.",
  ].join("\n");
}
