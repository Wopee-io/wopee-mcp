import { z } from "zod";
import { getConfig } from "../../utils/getConfig.js";
import { requestClient } from "../../utils/requestClient.js";
import { _parseError } from "../shared/helpers.js";
import { ToolName } from "../shared/types.js";
import { CreateGitHubIssue } from "../shared/gql-queries.js";

const InputSchema = z.object({
  title: z.string().describe("The title of the GitHub issue"),
  body: z
    .string()
    .describe("The body/description of the GitHub issue (supports Markdown)"),
  labels: z
    .array(z.string())
    .optional()
    .describe(
      "Optional labels to apply to the issue (e.g., ['bug', 'testing'])",
    ),
});

type Input = z.infer<typeof InputSchema>;

export const wopeeCreateGithubIssue = {
  name: ToolName.WOPEE_CREATE_GITHUB_ISSUE,
  config: {
    title: "Create GitHub issue",
    description:
      "Create a new GitHub issue in the project's connected repository. Use this to report bugs found during testing, track test failures, or create action items from chat discussions. The issue will be created in the GitHub repository linked to the current project. Requires the project to have GitHub integration configured and WOPEE_PROJECT_UUID to be set.",
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
        createGitHubIssue: {
          url: string;
          number: number;
          title: string;
        } | null;
      }>(CreateGitHubIssue, {
        projectUuid: WOPEE_PROJECT_UUID,
        title: input.title,
        body: input.body,
        labels: input.labels || [],
      });

      if (!result?.createGitHubIssue)
        return {
          content: [
            {
              type: "text" as const,
              text: "Failed to create GitHub issue. Make sure the project has GitHub integration configured.",
            },
          ],
        };

      return {
        content: [
          {
            type: "text" as const,
            text: `GitHub issue created successfully:\n- Title: ${result.createGitHubIssue.title}\n- Number: #${result.createGitHubIssue.number}\n- URL: ${result.createGitHubIssue.url}`,
          },
        ],
      };
    } catch (error) {
      return _parseError(error);
    }
  },
};
