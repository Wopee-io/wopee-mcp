import { wopee_get_test_cases } from '../../src/tools/wopee_get_test_cases';

// Mock the GraphQL client
const mockRequest = jest.fn();
jest.mock('../../src/graphql/client', () => ({
  graphqlClient: {
    getInstance: jest.fn(() => ({
      request: mockRequest,
    })),
  },
}));

describe('wopee_get_test_cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully get test cases', async () => {
    const mockResponse = {
      fetchFile: 'test cases content here',
    };

    mockRequest.mockResolvedValue(mockResponse);

    const params = {
      projectUuid: 'test-project-uuid',
      suiteUuid: 'test-suite-uuid',
    };

    const result = await wopee_get_test_cases(params);

    expect(result.success).toBe(true);
    expect(result.data).toBe('test cases content here');
    expect(result.message).toContain('Test cases retrieved successfully');
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining('fetchFile'),
      {
        projectUuid: 'test-project-uuid',
        suiteUuid: 'test-suite-uuid',
        bucket: 'project-suite-user-stories', // Same as user stories as specified
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

    const result = await wopee_get_test_cases(params);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to get test cases');
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining('fetchFile'),
      {
        projectUuid: 'test-project-uuid',
        suiteUuid: 'test-suite-uuid',
        bucket: 'project-suite-user-stories', // Same as user stories as specified
      }
    );
  });

  it('should validate required parameters', async () => {
    const params = {
      // Missing required parameters
    };

    const result = await wopee_get_test_cases(params as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to get test cases');
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

    const result = await wopee_get_test_cases(params);

    expect(result.success).toBe(true);
    expect(result.data).toBe('');
    expect(result.message).toContain('Test cases retrieved successfully');
  });
});
