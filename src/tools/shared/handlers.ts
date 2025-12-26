import {
  FetchArtifactInputSchema,
  FetchArtifactHandlerInput,
  UpdateArtifactInputSchema,
  UpdateArtifactHandlerInput,
  GenerateAIDataInputSchema,
  GenerateAIDataHandlerInput,
} from "./schemas.js";
import { FetchArtifact, UpdateArtifact } from "./gql-queries.js";
import {
  createFetchArtifactInput,
  createUpdateArtifactInput,
  createGenerateAIDataInput,
} from "./factories.js";
import { requestClient } from "../../utils/requestClient.js";
import {
  _convertToArtifactType,
  _parseError,
  _parseGenerateArtifactType,
} from "./helpers.js";

export async function fetchArtifact(input: FetchArtifactHandlerInput): Promise<{
  content: {
    type: "text";
    text: string;
  }[];
}> {
  try {
    const { type, suiteUuid, identifier } = input;

    const fetchArtifactInput = createFetchArtifactInput({
      type,
      suiteUuid,
      ...(identifier ? { identifier } : {}),
    });
    const parsedInput = FetchArtifactInputSchema.parse(fetchArtifactInput);
    const result: {
      fetchArtifact: {
        content: string | null;
        blobSha: string | null;
        commitSha: string | null;
        commitDate: string | null;
      };
    } | null = await requestClient(FetchArtifact, {
      input: parsedInput,
    });
    if (!result || !result?.fetchArtifact || !result?.fetchArtifact?.content)
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
          text: result.fetchArtifact.content,
        },
      ],
    };
  } catch (error) {
    return _parseError(error);
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
  const { query, dataKey, description } = _parseGenerateArtifactType(
    input.type
  );
  if (!query || !dataKey || !description)
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

    const convertedType = _convertToArtifactType(input.type);

    return await fetchArtifact({
      suiteUuid: parsedInput.suiteUuid,
      type: convertedType,
    });
  } catch (error) {
    return _parseError(error);
  }
}

export async function updateArtifact(input: UpdateArtifactHandlerInput) {
  try {
    const { type, suiteUuid, content, identifier } = input;

    const updateArtifactInput = createUpdateArtifactInput({
      type,
      content,
      suiteUuid,
      ...(identifier ? { identifier } : {}),
    });

    const parsedInput = UpdateArtifactInputSchema.parse(updateArtifactInput);
    const updateFileResult: { updateArtifact: boolean } | null =
      await requestClient(UpdateArtifact, {
        input: parsedInput,
      });
    if (!updateFileResult || !updateFileResult.updateArtifact)
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
    return _parseError(error);
  }
}
