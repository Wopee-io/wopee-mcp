// The text an MCP caller reads back after a dispatch — its only tracking handle.
//
// Imports are type-only so this module has no runtime dependencies, which keeps it unit-testable
// under `node --test` (strip-only mode cannot load the enums in shared/types.ts).
import type { ExecutedTestCase } from "../shared/types.js";
import type { WopeeDispatchAgentInput } from "./schema.js";

export interface DispatchFormatOptions {
  /** Running inside the Commander Assistant (WOPEE_AUTH_TOKEN set), which posts results to chat. */
  insideCommander: boolean;
}

export function formatDispatchSuccess(
  testCases: ExecutedTestCase[],
  input: WopeeDispatchAgentInput,
  { insideCommander }: DispatchFormatOptions,
): string {
  const lines: string[] = [
    "DISPATCH SUCCESSFUL — tests are now RUNNING (not yet completed).",
    "",
    "Tracking:",
    `- Suite UUID: ${testCases[0]?.suiteUuid ?? input.suiteUuid}`,
    `- Analysis Suite UUID: ${testCases[0]?.analysisSuiteUuid ?? "N/A"}`,
    `- Analysis Identifier: ${testCases[0]?.analysisIdentifier ?? input.analysisIdentifier}`,
    "",
    "Test cases dispatched:",
  ];

  // Each row's uuid and run name are the handles for tracking THIS dispatch (backlog#4382).
  // The run name is the GitHub Actions title verbatim and is unique per dispatch, so a caller
  // no longer has to guess which of several identically-named runs is its own.
  for (const tc of testCases) {
    lines.push(
      `- ${tc.userStoryId}:${tc.testCaseId} → executionStatus: ${tc.executionStatus}`,
      `  executedTestCaseUuid: ${tc.uuid}`,
      ...(tc.runName ? [`  runName: ${tc.runName}`] : []),
    );
  }

  lines.push(
    "",
    "IMPORTANT: These tests are RUNNING asynchronously. Do NOT report them as passed or failed.",
    "Tell the user their tests are running and results will be available shortly (typically 1-3 minutes).",
    insideCommander
      ? "You will receive a follow-up notification in chat when tests complete with full results."
      : "Poll wopee_fetch_recent_executions (or wopee_fetch_executed_test_cases for this suite) every 30-60 s until executionStatus is FINISHED or FAILED, then read agentReportStatus for the verdict.",
  );

  return lines.join("\n");
}

/**
 * The text for a dispatch that did not start. A usage limit or an auth error is named as such
 * with its hint, so the agent stops retrying; anything else may be transient.
 */
export function formatDispatchFailure(
  error: { message: string; code?: string },
  hint: string | null,
): string {
  if (error.code === "USAGE_LIMIT_EXCEEDED" || error.code === "AUTH_ERROR") {
    const what =
      error.code === "USAGE_LIMIT_EXCEEDED"
        ? "usage limit reached"
        : "authentication failed";
    return [
      `DISPATCH FAILED (${what}) — tests were NOT started.`,
      `Reason: [${error.code}] ${error.message}`,
      ...(hint ? [hint] : []),
    ].join("\n");
  }
  return `DISPATCH FAILED — tests were NOT started.\nReason: ${error.message}\nThis is a dispatch/infrastructure error, not a test failure. Suggest the user try again.`;
}
