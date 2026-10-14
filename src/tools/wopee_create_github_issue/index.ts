import { z } from "zod";
import { getConfig } from "../../utils/getConfig.js";
import { requestClient } from "../../utils/requestClient.js";
import { _parseError } from "../shared/helpers.js";
import { ToolName } from "../shared/types.js";
import { CreateGitHubIssue } from "../shared/gql-queries.js";
import { formatIssueCreated, type CreatedGitHubIssue } from "./format.js";

const InputSchema = z.object({
  title: z.string().describe("The title of the GitHub issue"),
  body: z
    .string()
    .optional()
    .describe(
      "The body/description of the GitHub issue (supports Markdown). Kept verbatim, above anything Wopee.io adds from the test run.",
    ),
  labels: z
    .array(z.string())
    .optional()
    .describe(
      "Optional labels to apply to the issue (e.g., ['bug', 'testing'])",
    ),
  executedTestCaseUuid: z
    .string()
    .optional()
    .describe(
      "UUID of the executed test case the issue is about (the executedTestCaseUuid shown by wopee_fetch_recent_executions and wopee_dispatch_agent, or uuid in wopee_fetch_executed_test_cases). When set, Wopee.io adds the failing step, expected vs actual, the failing step's screenshot and a link to the run in Commander, so the body only needs your own analysis.",
    ),
});

type Input = z.infer<typeof InputSchema>;

export const wopeeCreateGithubIssue = {
  name: ToolName.WOPEE_CREATE_GITHUB_ISSUE,
  config: {
    title: "Create GitHub issue",
    description:
      "Create a new GitHub issue in the project's connected repository. Use this to report bugs found during testing, track test failures, or create action items from chat discussions. For a failed test, pass its executedTestCaseUuid so the issue carries the run's evidence (failing step, expected vs actual, screenshot, report link). The issue is created by the Wopee.io GitHub App and names the requester in its body. Requires a GitHub repository linked to the project and WOPEE_PROJECT_UUID to be set.",
    inputSchema: InputSchema.shape,
  },
  handler: async (input: Input) => {
    try {
      const { WOPEE_PROJECT_UUID } = getConfig();

      if (!WOPEE_PROJECT_UUID)
        return {
          content: [
            { type: "text" as const, text: "WOPEE_PROJECT_UUID is not set" },
          ],
        };

      const result = await requestClient<{
        createGitHubIssue: CreatedGitHubIssue | null;
      }>(CreateGitHubIssue, {
        projectUuid: WOPEE_PROJECT_UUID,
        title: input.title,
        body: input.body ?? "",
        labels: input.labels || [],
        ...(input.executedTestCaseUuid && {
          executedTestCaseUuid: input.executedTestCaseUuid,
        }),
      });

      if (!result?.createGitHubIssue)
        return {
          content: [
            {
              type: "text" as const,
              text: "Failed to create GitHub issue. Make sure the project has a GitHub repository linked.",
            },
          ],
        };

      return {
        content: [
          {
            type: "text" as const,
            text: formatIssueCreated(result.createGitHubIssue, {
              withRunEvidence: !!input.executedTestCaseUuid,
            }),
          },
        ],
      };
    } catch (error) {
      return _parseError(error);
    }
  },
};
