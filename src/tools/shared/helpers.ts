import { z } from "zod";
import {
  GenerateAppContext,
  GenerateGeneralUserStories,
  GenerateReusableTestCases,
  GenerateReusableTestCaseSteps,
  GenerateTestCases,
  GenerateTestCaseSteps,
  GenerateUserStoriesWithTestCases,
} from "./gql-queries.js";
import { ArtifactType, GenerateArtifactType } from "./types.js";
import { RequestError } from "../../utils/requestClient.js";
import { compactUserStoriesContent } from "./artifactContent.js";

export function _convertToArtifactType(
  type: GenerateArtifactType,
): ArtifactType {
  switch (type) {
    case GenerateArtifactType.APP_CONTEXT:
      return ArtifactType.APP_CONTEXT;
    case GenerateArtifactType.GENERAL_USER_STORIES:
      return ArtifactType.GENERAL_USER_STORIES;
    case GenerateArtifactType.USER_STORIES_WITH_TEST_CASES:
    case GenerateArtifactType.REUSABLE_TEST_CASES:
    case GenerateArtifactType.REUSABLE_TEST_CASE_STEPS:
    case GenerateArtifactType.TEST_CASES:
    case GenerateArtifactType.TEST_CASE_STEPS:
      return ArtifactType.USER_STORIES;
  }
}

export function _parseGenerateArtifactType(type: GenerateArtifactType) {
  switch (type) {
    case GenerateArtifactType.APP_CONTEXT:
      return {
        query: GenerateAppContext,
        dataKey: "generateAppContext",
        description: "application's context markdown file for selected suite",
      };
    case GenerateArtifactType.GENERAL_USER_STORIES:
      return {
        query: GenerateGeneralUserStories,
        dataKey: "generateGeneralUserStories",
        description: "general user stories markdown file for selected suite",
      };
    case GenerateArtifactType.USER_STORIES_WITH_TEST_CASES:
      return {
        query: GenerateUserStoriesWithTestCases,
        dataKey: "generateUserStoriesWithTestCases",
        description:
          "generate user stories with test cases without test case steps JSON file for selected suite",
      };
    case GenerateArtifactType.TEST_CASES:
      return {
        query: GenerateTestCases,
        dataKey: "generateTestCases",
        description:
          "generate test cases without test case steps in user stories for selected suite",
      };
    case GenerateArtifactType.REUSABLE_TEST_CASES:
      return {
        query: GenerateReusableTestCases,
        dataKey: "generateReusableTestCases",
        description:
          "generate reusable blocks without test case steps in user stories for selected suite",
      };
    case GenerateArtifactType.REUSABLE_TEST_CASE_STEPS:
      return {
        query: GenerateReusableTestCaseSteps,
        dataKey: "generateReusableTestCaseSteps",
        description:
          "generate steps for reusable blocks in user stories for selected suite",
      };
    case GenerateArtifactType.TEST_CASE_STEPS:
      return {
        query: GenerateTestCaseSteps,
        dataKey: "generateTestCaseSteps",
        description:
          "generate test case steps for test cases in user stories for selected suite",
      };

    default:
      return {
        query: null,
        dataKey: null,
        description: null,
      };
  }
}

export function _parseError(error: unknown) {
  console.error(error instanceof z.ZodError ? error.issues : error);

  if (error instanceof RequestError) {
    return {
      content: [
        {
          type: "text" as const,
          text: `[${error.code}] ${error.message}${error.retryable ? " (retryable)" : ""}`,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text" as const,
        text: `Failed to parse input: ${
          error instanceof z.ZodError
            ? error.issues
                .map(
                  (issue) => `${issue.path[0] ?? "Unknown"}: ${issue.message}`,
                )
                .join("\n")
            : error instanceof Error
              ? error.message
              : "Unknown zod validation error"
        }`,
      },
    ],
  };
}

/**
 * Only USER_STORIES is JSON: APP_CONTEXT / GENERAL_USER_STORIES are markdown and
 * PLAYWRIGHT_CODE is TypeScript, where collapsing whitespace would corrupt the
 * file. See `compactUserStoriesContent` for why the artifact is compacted at all.
 */
export function _compactArtifactContentForModel(
  type: ArtifactType,
  content: string,
): string {
  if (type !== ArtifactType.USER_STORIES) return content;
  return compactUserStoriesContent(content);
}
