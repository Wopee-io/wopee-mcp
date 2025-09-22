import { graphqlClient } from '../graphql/client';
import { DispatchAnalysisParams, DispatchAnalysisSchema, ToolResult, AnalysisSuiteR } from '../types/index';

/**
 * GraphQL mutation for dispatching analysis
 */
const DISPATCH_ANALYSIS_MUTATION = `
  mutation DispatchAnalysis(
    $input: DispatchAnalysisInput!
  ) {
    dispatchAnalysis(input: $input) {
      uuid
      name
      createdAt
      updatedAt
      suiteType
      analysisIdentifier
      suiteRunningStatus
      generatedAnalysisDataState {
        uuid
      }
    }
  }
`;

/**
 * Dispatch a new analysis for the given project
 * 
 * @param params - Parameters containing project UUID and optional configuration
 * @returns Promise with analysis suite result
 */
export async function wopee_dispatch_analysis(params: DispatchAnalysisParams): Promise<ToolResult<AnalysisSuiteR>> {
  try {
    // Validate input parameters
    const validatedParams = DispatchAnalysisSchema.parse(params);

    // Execute GraphQL mutation with input object
    const response = await graphqlClient.getInstance().mutate<{ dispatchAnalysis: AnalysisSuiteR }>(
      DISPATCH_ANALYSIS_MUTATION,
      { input: validatedParams }
    );

    return {
      success: true,
      data: response.dispatchAnalysis,
      message: `Analysis dispatched successfully with ID: ${response.dispatchAnalysis.uuid}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      success: false,
      error: `Failed to dispatch analysis: ${errorMessage}`,
    };
  }
}
