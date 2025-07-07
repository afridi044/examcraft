import { authService, AuthResponse, SignInInput } from '../auth.service';
import { apiClient } from '../../api-client';

jest.mock('../../api-client');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('authService', () => {
  const input: SignInInput = { email: 'test@example.com', password: 'password123' };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('returns user data on success', async () => {
      const mockResponse: AuthResponse = {
        success: true,
        user: { id: '1', auth_id: 'auth1', email: 'test@example.com' },
        message: 'Signed in',
      };
      mockedApiClient.post.mockResolvedValueOnce({ 
        data: mockResponse, 
        error: null, 
        success: true 
      });
      
      const result = await authService.signIn(input);
      expect(result).toEqual(mockResponse);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/signin', input);
    });

    it('returns error object on API error', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ 
        data: null, 
        error: 'Invalid credentials', 
        success: false 
      });
      
      const result = await authService.signIn(input);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(result.message).toBe('Sign in failed');
      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/signin', input);
    });

    it('returns fallback error on network error', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Network error'));
      const result = await authService.signIn(input);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.message).toBe('Sign in failed');
    });

    it('returns fallback error on empty response', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ 
        data: null, 
        error: null, 
        success: false 
      });
      
      const result = await authService.signIn(input);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication failed');
      expect(result.message).toBe('Sign in failed');
    });

    it('handles NestJS error response format', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ 
        data: null, 
        error: 'Invalid login credentials', 
        success: false 
      });
      
      const result = await authService.signIn(input);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid login credentials');
      expect(result.message).toBe('Sign in failed');
      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/signin', input);
    });
  });

  // signUp tests
  describe('signUp', () => {
    const signUpInput = { email: 'new@example.com', password: 'newpass' };

    it('returns user data on success', async () => {
      const mockResponse: AuthResponse = {
        success: true,
        user: { id: '2', auth_id: 'auth2', email: 'new@example.com' },
        message: 'Signed up',
      };
      mockedApiClient.post.mockResolvedValueOnce({ 
        data: mockResponse, 
        error: null, 
        success: true 
      });
      
      const result = await authService.signUp(signUpInput);
      expect(result).toEqual(mockResponse);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/signup', signUpInput);
    });

    it('returns error object on API error', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ 
        data: null, 
        error: 'Email already exists', 
        success: false 
      });
      
      const result = await authService.signUp(signUpInput);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already exists');
      expect(result.message).toBe('Sign up failed');
    });

    it('returns fallback error on network error', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Network error'));
      const result = await authService.signUp(signUpInput);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.message).toBe('Sign up failed');
    });

    it('returns fallback error on empty response', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ 
        data: null, 
        error: null, 
        success: false 
      });
      
      const result = await authService.signUp(signUpInput);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Registration failed');
      expect(result.message).toBe('Sign up failed');
    });
  });

  // signOut tests
  describe('signOut', () => {
    it('returns success on sign out', async () => {
      const mockResponse: AuthResponse = {
        success: true,
        message: 'Signed out',
      };
      mockedApiClient.post.mockResolvedValueOnce({ 
        data: mockResponse, 
        error: null, 
        success: true 
      });
      
      const result = await authService.signOut();
      expect(result).toEqual(mockResponse);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/signout');
    });

    it('returns error object on API error', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ 
        data: null, 
        error: 'Session not found', 
        success: false 
      });
      
      const result = await authService.signOut();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Session not found');
      expect(result.message).toBe('Sign out failed');
    });

    it('returns fallback error on network error', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Network error'));
      const result = await authService.signOut();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.message).toBe('Sign out failed');
    });

    it('returns fallback error on empty response', async () => {
      mockedApiClient.post.mockResolvedValueOnce({ 
        data: null, 
        error: null, 
        success: false 
      });
      
      const result = await authService.signOut();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Sign out failed');
      expect(result.message).toBe('Sign out failed');
    });
  });
}); 