import { graphqlClient } from '../graphql/client';
import { GenerateAIDataParams, GenerateAIDataSchema, ToolResult, Bucket, FetchFileParams } from '../types/index';

/**
 * GraphQL mutation for generating app context
 */
const GENERATE_APP_CONTEXT_MUTATION = `
  mutation GenerateAppContext(
    $input: GenerateAIDataInput!
  ) {
    generateAppContext(input: $input)
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
 * Generate application context based on analysis results
 * 
 * @param params - Parameters containing project UUID, suite UUID and optional configuration
 * @returns Promise with generated app context data
 */
export async function wopee_generate_app_context(params: GenerateAIDataParams): Promise<ToolResult<string>> {
  try {
    // Validate input parameters
    const validatedParams = GenerateAIDataSchema.parse(params);

    // Execute GraphQL mutation with input object
    const response = await graphqlClient.getInstance().mutate<{ generateAppContext: boolean }>(
      GENERATE_APP_CONTEXT_MUTATION,
      { input: validatedParams }
    );

    if (response.generateAppContext) {
      // Fetch the generated data from the bucket
      const fetchParams: FetchFileParams = {
        projectUuid: validatedParams.projectUuid,
        suiteUuid: validatedParams.suiteUuid,
        bucket: Bucket.APP_CONTEXT,
      };

      const fetchResponse = await graphqlClient.getInstance().request<{ fetchFile: string }>(
        FETCH_FILE_QUERY,
        fetchParams
      );

      return {
        success: true,
        data: fetchResponse.fetchFile,
        message: `App context generated successfully for project: ${validatedParams.projectUuid}`,
      };
    } else {
      return {
        success: false,
        error: `Failed to generate app context for project: ${validatedParams.projectUuid}`,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      success: false,
      error: `Failed to generate app context: ${errorMessage}`,
    };
  }
}
