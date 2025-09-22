import { graphqlClient } from '../graphql/client';
import { GenerateAIDataParams, GenerateAIDataSchema, ToolResult, Bucket, FetchFileParams } from '../types/index';

/**
 * GraphQL mutation for generating user stories
 */
const GENERATE_USER_STORIES_MUTATION = `
  mutation GenerateUserStories(
    $projectUuid: ID!
    $suiteUuid: ID!
    $extraPrompt: String
    $selectedUserStories: [String!]
    $suiteAnalysisConfig: SuiteAnalysisConfigInput
    $continueGeneration: Boolean
  ) {
    generateUserStories(
      projectUuid: $projectUuid
      suiteUuid: $suiteUuid
      extraPrompt: $extraPrompt
      selectedUserStories: $selectedUserStories
      suiteAnalysisConfig: $suiteAnalysisConfig
      continueGeneration: $continueGeneration
    )
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
 * Generate user stories based on analysis results
 * 
 * @param params - Parameters containing project UUID, suite UUID and optional configuration
 * @returns Promise with generated user stories data
 */
export async function wopee_generate_user_stories(params: GenerateAIDataParams): Promise<ToolResult<string>> {
  try {
    // Validate input parameters
    const validatedParams = GenerateAIDataSchema.parse(params);

    // Execute GraphQL mutation
    const response = await graphqlClient.getInstance().mutate<{ generateUserStories: boolean }>(
      GENERATE_USER_STORIES_MUTATION,
      validatedParams
    );

    if (response.generateUserStories) {
      // Fetch the generated data from the bucket
      const fetchParams: FetchFileParams = {
        projectUuid: validatedParams.projectUuid,
        suiteUuid: validatedParams.suiteUuid,
        bucket: Bucket.USER_STORIES,
      };

      const fetchResponse = await graphqlClient.getInstance().request<{ fetchFile: string }>(
        FETCH_FILE_QUERY,
        fetchParams
      );

      return {
        success: true,
        data: fetchResponse.fetchFile,
        message: `User stories generated successfully for project: ${validatedParams.projectUuid}`,
      };
    } else {
      return {
        success: false,
        error: `Failed to generate user stories for project: ${validatedParams.projectUuid}`,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      success: false,
      error: `Failed to generate user stories: ${errorMessage}`,
    };
  }
}
