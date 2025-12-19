import { z } from "zod";
import {
  FetchFileInputSchema,
  FetchFileHandlerInput,
  UpdateFileInputSchema,
  UpdateFileHandlerInput,
  GenerateAIDataInputSchema,
  GenerateAIDataHandlerInput,
} from "./schemas.js";
import {
  FetchFile,
  UpdateFile,
  GenerateAppContext,
  GenerateGeneralUserStories,
  GenerateUserStoriesWithTestCases,
  GenerateTestCases,
  GenerateReusableTestCases,
  GenerateReusableTestCaseSteps,
  GenerateTestCaseSteps,
} from "./gql-queries.js";
import {
  createFetchFileInput,
  createUpdateFileInput,
  createGenerateAIDataInput,
} from "./factories.js";
import { Bucket, FileType } from "./types.js";
import { requestClient } from "../../utils/requestClient.js";

export function parseError(error: unknown) {
  console.error(error instanceof z.ZodError ? error.issues : error);
  return {
    content: [
      {
        type: "text" as const,
        text: `Failed to parse input: ${
          error instanceof z.ZodError
            ? error.issues
                .map(
                  (issue) => `${issue.path[0] ?? "Unknown"}: ${issue.message}`
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

function parseFileType(type: FileType) {
  switch (type) {
    case FileType.APP_CONTEXT:
      return {
        query: GenerateAppContext,
        dataKey: "generateAppContext",
        bucket: Bucket.APP_CONTEXT,
        outputType: "markdown" as const,
        description: "application's context markdown file for selected suite",
      };
    case FileType.GENERAL_USER_STORIES:
      return {
        query: GenerateGeneralUserStories,
        dataKey: "generateGeneralUserStories",
        bucket: Bucket.GENERAL_USER_STORIES,
        outputType: "markdown" as const,
        description: "general user stories markdown file for selected suite",
      };
    case FileType.USER_STORIES_WITH_TEST_CASES:
      return {
        query: GenerateUserStoriesWithTestCases,
        dataKey: "generateUserStoriesWithTestCases",
        bucket: Bucket.USER_STORIES,
        outputType: "json" as const,
        description:
          "generate user stories with test cases without test case steps JSON file for selected suite",
      };
    case FileType.TEST_CASES:
      return {
        query: GenerateTestCases,
        dataKey: "generateTestCases",
        bucket: Bucket.USER_STORIES,
        outputType: "json" as const,
        description:
          "generate test cases without test case steps in user stories for selected suite",
      };
    case FileType.REUSABLE_TEST_CASES:
      return {
        query: GenerateReusableTestCases,
        dataKey: "generateReusableTestCases",
        bucket: Bucket.USER_STORIES,
        outputType: "json" as const,
        description:
          "generate reusable blocks without test case steps in user stories for selected suite",
      };
    case FileType.REUSABLE_TEST_CASE_STEPS:
      return {
        query: GenerateReusableTestCaseSteps,
        dataKey: "generateReusableTestCaseSteps",
        bucket: Bucket.USER_STORIES,
        outputType: "json" as const,
        description:
          "generate steps for reusable blocks in user stories for selected suite",
      };
    case FileType.TEST_CASE_STEPS:
      return {
        query: GenerateTestCaseSteps,
        dataKey: "generateTestCaseSteps",
        bucket: Bucket.USER_STORIES,
        outputType: "json" as const,
        description:
          "generate test case steps for test cases in user stories for selected suite",
      };
    case FileType.PLAYWRIGHT_CODE:
      return {
        query: null,
        dataKey: null,
        bucket: Bucket.PLAYWRIGHT_CODE,
        outputType: "typescript" as const,
        description: "fetch playwright code for selected test case",
      };
    default:
      return {
        query: null,
        dataKey: null,
        bucket: null,
        outputType: null,
        description: null,
      };
  }
}

export async function fetchFile(input: FetchFileHandlerInput): Promise<{
  content: {
    type: "text";
    text: string;
  }[];
}> {
  try {
    const { bucket, description } = parseFileType(input.fileType);
    if (!bucket || !description)
      return {
        content: [
          {
            type: "text" as const,
            text: "Failed to parse file type",
          },
        ],
      };
    const fetchFileInput = createFetchFileInput({
      bucket,
      suiteUuid: input.suiteUuid,
      identifier: input.identifier,
    });
    console.error("FETCH FILE INPUT", fetchFileInput);
    const parsedInput = FetchFileInputSchema.parse(fetchFileInput);
    console.error("PARSED INPUT", parsedInput);
    const result: { fetchFile: string } | null = await requestClient(
      FetchFile,
      parsedInput
    );
    if (!result || !result.fetchFile)
      return {
        content: [
          {
            type: "text" as const,
            text: "Failed to fetch file",
          },
        ],
      };
    return {
      content: [
        {
          type: "text" as const,
          text: result.fetchFile,
        },
      ],
    };
  } catch (error) {
    return parseError(error);
  }
}

export async function generateAIDataFile(
  input: GenerateAIDataHandlerInput
): Promise<{
  content: {
    type: "text";
    text: string;
  }[];
}> {
  const { query, dataKey, bucket, description } = parseFileType(input.fileType);
  if (!query || !dataKey || !description || !bucket)
    return {
      content: [
        {
          type: "text" as const,
          text: "Failed to parse generation type",
        },
      ],
    };

  try {
    const generateAIDataInput = createGenerateAIDataInput(input);
    const parsedInput = GenerateAIDataInputSchema.parse(generateAIDataInput);
    const generationResult: { [dataKey]: boolean } | null = await requestClient(
      query,
      {
        input: parsedInput,
      }
    );
    if (!generationResult || !generationResult[dataKey])
      return {
        content: [
          {
            type: "text" as const,
            text: `Failed to generate ${description}`,
          },
        ],
      };

    return await fetchFile({
      suiteUuid: parsedInput.suiteUuid,
      fileType: input.fileType,
    });
  } catch (error) {
    return parseError(error);
  }
}

export async function updateFile(input: UpdateFileHandlerInput) {
  try {
    const { bucket, outputType } = parseFileType(input.fileType);
    if (!bucket || !outputType)
      return {
        content: [
          {
            type: "text" as const,
            text: "Failed to parse file type",
          },
        ],
      };

    const updateFileInput = createUpdateFileInput({
      bucket,
      outputType,
      suiteUuid: input.suiteUuid,
      fileContent: input.fileContent,
      identifier: input.identifier,
    });

    const parsedInput = UpdateFileInputSchema.parse(updateFileInput);
    const updateFileResult: { updateFile: boolean } | null =
      await requestClient(UpdateFile, {
        input: parsedInput,
      });
    if (!updateFileResult || !updateFileResult.updateFile)
      return {
        content: [
          {
            type: "text" as const,
            text: "Failed to update file",
          },
        ],
      };

    return {
      content: [
        {
          type: "text" as const,
          text: "File updated successfully",
        },
      ],
    };
  } catch (error) {
    return parseError(error);
  }
}
