import { wopee_get_app_context } from '../../src/tools/wopee_get_app_context';

// Mock the GraphQL client
const mockRequest = jest.fn();
jest.mock('../../src/graphql/client', () => ({
  graphqlClient: {
    getInstance: jest.fn(() => ({
      request: mockRequest,
    })),
  },
}));

describe('wopee_get_app_context', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully get app context', async () => {
    const mockResponse = {
      fetchFile: 'app context content here',
    };

    mockRequest.mockResolvedValue(mockResponse);

    const params = {
      projectUuid: 'test-project-uuid',
      suiteUuid: 'test-suite-uuid',
    };

    const result = await wopee_get_app_context(params);

    expect(result.success).toBe(true);
    expect(result.data).toBe('app context content here');
    expect(result.message).toContain('App context retrieved successfully');
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining('fetchFile'),
      {
        projectUuid: 'test-project-uuid',
        suiteUuid: 'test-suite-uuid',
        bucket: 'project-suite-app-context',
      }
    );
  });

  it('should handle GraphQL errors gracefully', async () => {
    const mockError = new Error('GraphQL request failed: File not found');
    mockRequest.mockRejectedValue(mockError);

    const params = {
      projectUuid: 'test-project-uuid',
      suiteUuid: 'test-suite-uuid',
    };

    const result = await wopee_get_app_context(params);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to get app context');
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining('fetchFile'),
      {
        projectUuid: 'test-project-uuid',
        suiteUuid: 'test-suite-uuid',
        bucket: 'project-suite-app-context',
      }
    );
  });

  it('should validate required parameters', async () => {
    const params = {
      // Missing required parameters
    };

    const result = await wopee_get_app_context(params as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to get app context');
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('should handle empty response gracefully', async () => {
    const mockResponse = {
      fetchFile: '',
    };

    mockRequest.mockResolvedValue(mockResponse);

    const params = {
      projectUuid: 'test-project-uuid',
      suiteUuid: 'test-suite-uuid',
    };

    const result = await wopee_get_app_context(params);

    expect(result.success).toBe(true);
    expect(result.data).toBe('');
    expect(result.message).toContain('App context retrieved successfully');
  });
});
