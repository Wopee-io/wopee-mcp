import { graphqlClient } from '../graphql/client';
import { GenerateAIDataParams, GenerateAIDataSchema, ToolResult, Bucket, FetchFileParams } from '../types/index';

/**
 * GraphQL mutation for generating general user stories
 */
const GENERATE_GENERAL_USER_STORIES_MUTATION = `
  mutation GenerateGeneralUserStories(
    $input: GenerateAIDataInput!
  ) {
    generateGeneralUserStories(input: $input)
  }
`;

/**
 * GraphQL query for fetching generated data
 */
const FETCH_FILE_QUERY = `
  query FetchFile($projectUuid: ID!, $suiteUuid: ID!, $bucket: String!) {
    fetchFile(projectUuid: $projectUuid, suiteUuid: $suiteUuid, bucket: $bucket)
  }
`;

/**
 * Generate general user stories based on analysis results
 * 
 * @param params - Parameters containing project UUID, suite UUID and optional configuration
 * @returns Promise with generated general user stories data
 */
export async function wopee_generate_general_user_stories(params: GenerateAIDataParams): Promise<ToolResult<string>> {
  try {
    // Validate input parameters
    const validatedParams = GenerateAIDataSchema.parse(params);

    // Execute GraphQL mutation with input object
    const response = await graphqlClient.getInstance().mutate<{ generateGeneralUserStories: boolean }>(
      GENERATE_GENERAL_USER_STORIES_MUTATION,
      { input: validatedParams }
    );

    if (response.generateGeneralUserStories) {
      // Fetch the generated data from the bucket
      const fetchParams: FetchFileParams = {
        projectUuid: validatedParams.projectUuid,
        suiteUuid: validatedParams.suiteUuid,
        bucket: Bucket.GENERAL_USER_STORIES,
      };

      const fetchResponse = await graphqlClient.getInstance().request<{ fetchFile: string }>(
        FETCH_FILE_QUERY,
        fetchParams
      );

      return {
        success: true,
        data: fetchResponse.fetchFile,
        message: `General user stories generated successfully for project: ${validatedParams.projectUuid}`,
      };
    } else {
      return {
        success: false,
        error: `Failed to generate general user stories for project: ${validatedParams.projectUuid}`,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      success: false,
      error: `Failed to generate general user stories: ${errorMessage}`,
    };
  }
}
