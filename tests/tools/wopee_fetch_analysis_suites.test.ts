import { wopee_fetch_analysis_suites } from '../../src/tools/wopee_fetch_analysis_suites';
import { FetchAnalysisSuiteResponse, SuiteType, SuiteRunningStatus, UploadStatus, ExecutionStatus, GenerationStatus } from '../../src/types/index';

// Mock the GraphQL client
const mockRequest = jest.fn();
jest.mock('../../src/graphql/client', () => ({
  graphqlClient: {
    getInstance: jest.fn(() => ({
      request: mockRequest,
    })),
  },
}));

describe('wopee_fetch_analysis_suites', () => {
  const mockProjectUuid = 'test-project-uuid';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully fetch analysis suites', async () => {
    const mockResponse: FetchAnalysisSuiteResponse[] = [
      {
        uuid: 'suite-uuid-1',
        name: 'Test Suite 1',
        suiteType: SuiteType.ANALYSIS,
        uploadStatus: UploadStatus.FINISHED,
        executionStatus: ExecutionStatus.FINISHED,
        analysisIdentifier: 'analysis-1',
        suiteRunningStatus: SuiteRunningStatus.FINISHED,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T01:00:00Z',
        generatedAnalysisDataState: {
          uuid: 'data-state-uuid-1',
          suiteUuid: 'suite-uuid-1',
          appContext: {
            uuid: 'app-context-uuid',
            isGenerated: true,
            status: GenerationStatus.FINISHED,
          },
          generalUserStories: {
            uuid: 'general-stories-uuid',
            isGenerated: true,
            status: GenerationStatus.FINISHED,
          },
          userStories: {
            uuid: 'user-stories-uuid',
            isGenerated: true,
            status: GenerationStatus.FINISHED,
          },
          testCases: {
            uuid: 'test-cases-uuid',
            isGenerated: true,
            status: GenerationStatus.FINISHED,
          },
        },
      },
      {
        uuid: 'suite-uuid-2',
        name: 'Test Suite 2',
        suiteType: SuiteType.CODE,
        uploadStatus: UploadStatus.IN_PROGRESS,
        executionStatus: ExecutionStatus.IN_PROGRESS,
        analysisIdentifier: 'analysis-2',
        suiteRunningStatus: SuiteRunningStatus.IN_PROGRESS,
        createdAt: '2023-01-02T00:00:00Z',
        updatedAt: '2023-01-02T01:00:00Z',
        generatedAnalysisDataState: {
          uuid: 'data-state-uuid-2',
          suiteUuid: 'suite-uuid-2',
          appContext: {
            uuid: 'app-context-uuid-2',
            isGenerated: false,
            status: GenerationStatus.IN_PROGRESS,
          },
        },
      },
    ];

    mockRequest.mockResolvedValue({
      fetchAnalysisSuites: mockResponse,
    });

    const result = await wopee_fetch_analysis_suites({
      projectUuid: mockProjectUuid,
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockResponse);
    expect(result.message).toBe('Found 2 analysis suites');
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining('query FetchAnalysisSuites'),
      { projectUuid: mockProjectUuid }
    );
  });

  it('should handle empty response', async () => {
    mockRequest.mockResolvedValue({
      fetchAnalysisSuites: [],
    });

    const result = await wopee_fetch_analysis_suites({
      projectUuid: mockProjectUuid,
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
    expect(result.message).toBe('Found 0 analysis suites');
  });

  it('should handle null response', async () => {
    mockRequest.mockResolvedValue({
      fetchAnalysisSuites: null,
    });

    const result = await wopee_fetch_analysis_suites({
      projectUuid: mockProjectUuid,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('No analysis suites found for the specified project');
    expect(result.data).toBeUndefined();
  });

  it('should handle GraphQL errors', async () => {
    const mockError = new Error('GraphQL error: Project not found');
    mockRequest.mockRejectedValue(mockError);

    const result = await wopee_fetch_analysis_suites({
      projectUuid: mockProjectUuid,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to fetch analysis suites: GraphQL error: Project not found');
    expect(result.data).toBeUndefined();
  });

  it('should handle unknown errors', async () => {
    mockRequest.mockRejectedValue('Unknown error');

    const result = await wopee_fetch_analysis_suites({
      projectUuid: mockProjectUuid,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to fetch analysis suites: Unknown error occurred');
    expect(result.data).toBeUndefined();
  });

  it('should handle suites with minimal data', async () => {
    const mockResponse: FetchAnalysisSuiteResponse[] = [
      {
        uuid: 'suite-uuid-minimal',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T01:00:00Z',
      },
    ];

    mockRequest.mockResolvedValue({
      fetchAnalysisSuites: mockResponse,
    });

    const result = await wopee_fetch_analysis_suites({
      projectUuid: mockProjectUuid,
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockResponse);
    expect(result.message).toBe('Found 1 analysis suites');
  });

  it('should handle suites with partial generation state', async () => {
    const mockResponse: FetchAnalysisSuiteResponse[] = [
      {
        uuid: 'suite-uuid-partial',
        name: 'Partial Suite',
        suiteType: SuiteType.AGENT,
        uploadStatus: UploadStatus.FINISHED,
        executionStatus: ExecutionStatus.FINISHED,
        analysisIdentifier: 'analysis-partial',
        suiteRunningStatus: SuiteRunningStatus.IDLE,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T01:00:00Z',
        generatedAnalysisDataState: {
          uuid: 'data-state-uuid-partial',
          suiteUuid: 'suite-uuid-partial',
          appContext: {
            uuid: 'app-context-uuid-partial',
            isGenerated: true,
            status: GenerationStatus.FINISHED,
          },
          // Other generation states are undefined
        },
      },
    ];

    mockRequest.mockResolvedValue({
      fetchAnalysisSuites: mockResponse,
    });

    const result = await wopee_fetch_analysis_suites({
      projectUuid: mockProjectUuid,
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockResponse);
    expect(result.data?.[0]?.generatedAnalysisDataState?.appContext?.status).toBe(GenerationStatus.FINISHED);
    expect(result.data?.[0]?.generatedAnalysisDataState?.userStories).toBeUndefined();
  });
});
