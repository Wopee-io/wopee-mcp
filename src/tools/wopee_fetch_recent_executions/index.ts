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
      "Fetch the most recent test case executions for the current project (up to 20, newest first). Use this to check the status of recently dispatched tests without needing to remember specific suite UUIDs. Returns execution status (IN_PROGRESS, IN_QUEUE, FINISHED, FAILED), agent reports, and pass/fail results. Takes no input; uses WOPEE_PROJECT_UUID from environment. Prefer this tool when the user asks 'what's the status?' or 'how did the tests go?' and you don't have the specific suite UUID handy.",
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
        let status: string;
        if (tc.executionStatus === "FINISHED") {
          status = tc.agentReportStatus ?? "FINISHED";
        } else {
          status = tc.executionStatus;
        }

        lines.push(
          `- ${tc.userStoryId}:${tc.testCaseId} [${tc.analysisIdentifier}] → ${status} (${tc.updatedAt})`,
        );

        if (tc.executionStatus === "FINISHED" && tc.agentReport) {
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
