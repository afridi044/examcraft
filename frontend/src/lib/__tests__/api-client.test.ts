import { APIClient } from '../api-client';

// Mock fetch globally
global.fetch = jest.fn();

describe('APIClient', () => {
  let apiClient: APIClient;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    apiClient = new APIClient('http://localhost:5001/api/v1');
    jest.clearAllMocks();
  });

  describe('Error Handling', () => {
    it('handles NestJS error response format correctly', async () => {
      const nestJSError = {
        statusCode: 401,
        message: 'Invalid login credentials',
        error: 'Unauthorized'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => nestJSError,
      } as Response);

      const result = await apiClient.post('/auth/signin', { email: 'test@example.com', password: 'wrong' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Session expired. Please sign in again.');
      expect(result.data).toBeNull();
    });

    it('handles generic HTTP error when no message field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      } as Response);

      const result = await apiClient.post('/auth/signin', { email: 'test@example.com', password: 'wrong' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('HTTP 500: Internal Server Error');
      expect(result.data).toBeNull();
    });

    it('handles network errors correctly', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await apiClient.post('/auth/signin', { email: 'test@example.com', password: 'wrong' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.data).toBeNull();
    });

    it('handles successful auth response', async () => {
      const successResponse = {
        success: true,
        user: { id: '1', email: 'test@example.com' },
        message: 'Sign in successful'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => successResponse,
      } as Response);

      const result = await apiClient.post('/auth/signin', { email: 'test@example.com', password: 'correct' });

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.data).toEqual(successResponse);
    });
  });
}); 