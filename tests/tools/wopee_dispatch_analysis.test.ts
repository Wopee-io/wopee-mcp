import { wopee_dispatch_analysis } from '../../src/tools/wopee_dispatch_analysis';

// Mock the GraphQL client
const mockMutate = jest.fn();
jest.mock('../../src/graphql/client', () => ({
  graphqlClient: {
    getInstance: jest.fn(() => ({
      mutate: mockMutate,
    })),
  },
}));

describe('wopee_dispatch_analysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully dispatch analysis with valid project UUID', async () => {
    const mockResponse = {
      dispatchAnalysis: {
        uuid: 'suite-123',
        name: 'Test Analysis',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        suiteType: 'ANALYSIS',
        analysisIdentifier: 'analysis-123',
        suiteRunningStatus: 'PENDING',
        generatedAnalysisDataState: 'PENDING',
      },
    };

    mockMutate.mockResolvedValue(mockResponse);

    const params = {
      projectUuid: 'project-123',
    };

    const result = await wopee_dispatch_analysis(params);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockResponse.dispatchAnalysis);
    expect(result.message).toContain('Analysis dispatched successfully');
    expect(mockMutate).toHaveBeenCalledWith(
      expect.stringContaining('dispatchAnalysis'),
      { input: { projectUuid: 'project-123' } }
    );
  });

  it('should successfully dispatch analysis with full configuration', async () => {
    const mockResponse = {
      dispatchAnalysis: {
        uuid: 'suite-123',
        name: 'Test Analysis',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        suiteType: 'ANALYSIS',
        analysisIdentifier: 'analysis-123',
        suiteRunningStatus: 'PENDING',
        generatedAnalysisDataState: 'PENDING',
      },
    };

    mockMutate.mockResolvedValue(mockResponse);

    const params = {
      projectUuid: 'project-123',
      iterations: 5,
      suiteAnalysisConfig: {
        startingUrl: 'https://example.com',
        username: 'testuser',
        password: 'testpass',
        cookiesPreference: 'ACCEPT_ALL' as any,
        additionalInstructions: 'Test instructions',
        additionalVariables: 'Test variables',
      },
    };

    const result = await wopee_dispatch_analysis(params);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockResponse.dispatchAnalysis);
    expect(mockMutate).toHaveBeenCalledWith(
      expect.stringContaining('dispatchAnalysis'),
      { input: params }
    );
  });

  it('should handle GraphQL errors gracefully', async () => {
    const mockError = new Error('GraphQL request failed: Invalid project UUID');
    mockMutate.mockRejectedValue(mockError);

    const params = {
      projectUuid: 'invalid-project',
    };

    const result = await wopee_dispatch_analysis(params);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to dispatch analysis');
    expect(result.error).toContain('Invalid project UUID');
  });

  it('should validate required project UUID', async () => {
    const invalidParams = {};

    const result = await wopee_dispatch_analysis(invalidParams as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to dispatch analysis');
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should validate URL format in suiteAnalysisConfig', async () => {
    const invalidParams = {
      projectUuid: 'project-123',
      suiteAnalysisConfig: {
        startingUrl: 'not-a-valid-url',
      },
    };

    const result = await wopee_dispatch_analysis(invalidParams as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to dispatch analysis');
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
