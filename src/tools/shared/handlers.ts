import { z } from "zod";
import {
  FetchFileInputSchema,
  GenerateAIDataInputSchema,
  GenerateAIDataHandlerInput,
} from "./schemas.js";
import {
  FetchFile,
  GenerateTestCases,
  GenerateAppContext,
  GenerateUserStories,
  GenerateGeneralUserStories,
} from "./gql-queries.js";
import {
  createFetchFileInput,
  createGenerateAIDataInput,
} from "./factories.js";
import { Bucket, GenerationType } from "./types.js";
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

function parseGenerationType(type: GenerationType) {
  switch (type) {
    case GenerationType.APP_CONTEXT:
      return {
        query: GenerateAppContext,
        dataKey: "generateAppContext",
        bucket: Bucket.APP_CONTEXT,
        description: "application's context markdown file for selected suite",
      };
    case GenerationType.GENERAL_USER_STORIES:
      return {
        query: GenerateGeneralUserStories,
        dataKey: "generateGeneralUserStories",
        bucket: Bucket.GENERAL_USER_STORIES,
        description: "general user stories markdown file for selected suite",
      };
    case GenerationType.USER_STORIES:
      return {
        query: GenerateUserStories,
        dataKey: "generateUserStories",
        bucket: Bucket.USER_STORIES,
        description: "user stories JSON file for selected suite",
      };
    case GenerationType.TEST_CASES:
      return {
        query: GenerateTestCases,
        dataKey: "generateTestCases",
        bucket: Bucket.USER_STORIES,
        description: "test cases for selected suite",
      };
    default:
      return {
        query: null,
        dataKey: null,
        description: null,
      };
  }
}

export async function fetchFile(input: {
  suiteUuid: string;
  bucket: (typeof Bucket)[keyof typeof Bucket];
}): Promise<{
  content: {
    type: "text";
    text: string;
  }[];
}> {
  try {
    const fetchFileInput = createFetchFileInput(input);
    const parsedInput = FetchFileInputSchema.parse(fetchFileInput);

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
  type: GenerationType,
  input: GenerateAIDataHandlerInput
): Promise<{
  content: {
    type: "text";
    text: string;
  }[];
}> {
  const { query, dataKey, bucket, description } = parseGenerationType(type);
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
      bucket,
    });
  } catch (error) {
    return parseError(error);
  }
}
