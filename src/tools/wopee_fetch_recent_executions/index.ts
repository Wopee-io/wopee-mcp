import { getConfig } from "../../utils/getConfig.js";
import { requestClient } from "../../utils/requestClient.js";
import { _parseError } from "../shared/helpers.js";
import { ExecutedTestCase, ToolName } from "../shared/types.js";
import { FetchRecentExecutedTestCases } from "../shared/gql-queries.js";

export const wopeeFetchRecentExecutions = {
  name: ToolName.WOPEE_FETCH_RECENT_EXECUTIONS,
  config: {
    title: "Fetch recent test executions",
    description:
      "Fetch the most recent test case executions for the current project (up to 20, newest first). Use this to check the status of recently dispatched tests without needing to remember specific suite UUIDs. Returns each run's verdict (PASSED, FAILED, or INCOMPLETE — the run never established a result, e.g. an infrastructure error, and says nothing about the application) or, for a run with no verdict yet, its execution status (IN_QUEUE, IN_PROGRESS, FINISHED, FAILED, STOPPED), plus agent reports. Takes no input; uses WOPEE_PROJECT_UUID from environment. Prefer this tool when the user asks 'what's the status?' or 'how did the tests go?' and you don't have the specific suite UUID handy.",
  },
  handler: async () => {
    try {
      const { WOPEE_PROJECT_UUID } = getConfig();

      if (!WOPEE_PROJECT_UUID)
        return {
          content: [
            {
              type: "text" as const,
              text: "WOPEE_PROJECT_UUID is not set",
            },
          ],
        };

      const result = await requestClient<{
        fetchRecentExecutedTestCases: ExecutedTestCase[];
      }>(FetchRecentExecutedTestCases, {
        projectUuid: WOPEE_PROJECT_UUID,
      });

      if (!result?.fetchRecentExecutedTestCases)
        return {
          content: [
            {
              type: "text" as const,
              text: "No recent test executions found for this project.",
            },
          ],
        };

      const executions = result.fetchRecentExecutedTestCases;

      if (executions.length === 0)
        return {
          content: [
            {
              type: "text" as const,
              text: "No recent test executions found for this project.",
            },
          ],
        };

      const lines: string[] = [
        `Recent test executions (${executions.length} most recent):`,
        "",
      ];

      for (const tc of executions) {
        // The verdict first (backlog#4453). A run whose agent threw is FAILED underneath but
        // INCOMPLETE on top, and reporting it as FAILED tells the user their app is broken.
        const status = tc.agentReportStatus ?? tc.executionStatus;

        lines.push(
          `- ${tc.userStoryId}:${tc.testCaseId} [${tc.analysisIdentifier}] → ${status} (${tc.updatedAt})`,
        );

        // Any report, not only a FINISHED run's: an incomplete run's report is what names the
        // infrastructure error behind it.
        if (tc.agentReport) {
          const shortReport = tc.agentReport.slice(0, 200);
          lines.push(
            `  Report: ${shortReport}${tc.agentReport.length > 200 ? "..." : ""}`,
          );
        }
      }

      lines.push(
        "",
        `Suite UUID of most recent: ${executions[0].suiteUuid}`,
        `Analysis Identifier of most recent: ${executions[0].analysisIdentifier}`,
      );

      return {
        content: [
          {
            type: "text" as const,
            text: lines.join("\n"),
          },
        ],
      };
    } catch (error) {
      return _parseError(error);
    }
  },
};
