import { userService } from '../user.service';
import { apiClient } from '../../api-client';

jest.mock('../../api-client');

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('userService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('returns current user without authId parameter', async () => {
      const mockResponse = {
        id: 'user123',
        auth_id: 'auth123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe',
        institution: 'University of Technology',
        field_of_study: 'Computer Science'
      };

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await userService.getCurrentUser();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.get).toHaveBeenCalledWith('/users/current');
    });

    it('returns current user with authId parameter', async () => {
      const authId = 'auth123';
      const mockResponse = {
        id: 'user123',
        auth_id: authId,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe'
      };

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await userService.getCurrentUser(authId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.get).toHaveBeenCalledWith('/users/current?authId=auth123');
    });

    it('handles user not found error', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'User not found',
        success: false
      });

      const result = await userService.getCurrentUser();

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('handles authentication error', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Unauthorized',
        success: false
      });

      const result = await userService.getCurrentUser();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('encodes authId parameter correctly', async () => {
      const authId = 'auth@123.com';
      
      mockedApiClient.get.mockResolvedValueOnce({
        data: { id: 'user123', auth_id: authId, email: 'test@example.com' },
        error: null,
        success: true
      });

      await userService.getCurrentUser(authId);

      expect(mockedApiClient.get).toHaveBeenCalledWith('/users/current?authId=auth%40123.com');
    });
  });

  describe('getUserById', () => {
    const userId = 'user123';

    it('returns user by ID successfully', async () => {
      const mockResponse = {
        id: userId,
        auth_id: 'auth123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe',
        institution: 'University of Technology',
        field_of_study: 'Computer Science'
      };

      mockedApiClient.get.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await userService.getUserById(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.get).toHaveBeenCalledWith(`/users/${userId}`);
    });

    it('handles user not found error', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'User not found',
        success: false
      });

      const result = await userService.getUserById(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('handles invalid user ID', async () => {
      const invalidUserId = 'invalid-id';

      mockedApiClient.get.mockResolvedValueOnce({
        data: null,
        error: 'Invalid user ID',
        success: false
      });

      const result = await userService.getUserById(invalidUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user ID');
      expect(mockedApiClient.get).toHaveBeenCalledWith(`/users/${invalidUserId}`);
    });
  });

  describe('createUser', () => {
    const input = {
      email: 'newuser@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      institution: 'Tech University',
      field_of_study: 'Data Science'
    };

    it('creates user successfully', async () => {
      const mockResponse = {
        id: 'new-user-id',
        auth_id: 'new-auth-id',
        email: input.email,
        first_name: input.first_name,
        last_name: input.last_name,
        institution: input.institution,
        field_of_study: input.field_of_study
      };

      mockedApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await userService.createUser(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.post).toHaveBeenCalledWith('/users', input);
    });

    it('handles email already exists error', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: null,
        error: 'Email already exists',
        success: false
      });

      const result = await userService.createUser(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already exists');
    });

    it('handles validation error', async () => {
      const invalidInput = {
        email: 'invalid-email',
        first_name: '',
        last_name: 'Smith'
      };

      mockedApiClient.post.mockResolvedValueOnce({
        data: null,
        error: 'Validation failed',
        success: false
      });

      const result = await userService.createUser(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
      expect(mockedApiClient.post).toHaveBeenCalledWith('/users', invalidInput);
    });

    it('handles server error', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: null,
        error: 'Internal server error',
        success: false
      });

      const result = await userService.createUser(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Internal server error');
    });
  });

  describe('updateUser', () => {
    const userId = 'user123';
    const input = {
      first_name: 'Updated',
      last_name: 'Name',
      institution: 'New University',
      field_of_study: 'Updated Field'
    };

    it('updates user successfully', async () => {
      const mockResponse = {
        id: userId,
        auth_id: 'auth123',
        email: 'test@example.com',
        first_name: input.first_name,
        last_name: input.last_name,
        institution: input.institution,
        field_of_study: input.field_of_study
      };

      mockedApiClient.patch.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await userService.updateUser(userId, input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.patch).toHaveBeenCalledWith(`/users/${userId}`, input);
    });

    it('handles partial update', async () => {
      const partialInput = {
        first_name: 'Only First Name Updated'
      };

      const mockResponse = {
        id: userId,
        auth_id: 'auth123',
        email: 'test@example.com',
        first_name: partialInput.first_name,
        last_name: 'Original Last Name'
      };

      mockedApiClient.patch.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await userService.updateUser(userId, partialInput);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.patch).toHaveBeenCalledWith(`/users/${userId}`, partialInput);
    });

    it('handles user not found error', async () => {
      const nonExistentUserId = 'non-existent-user';

      mockedApiClient.patch.mockResolvedValueOnce({
        data: null,
        error: 'User not found',
        success: false
      });

      const result = await userService.updateUser(nonExistentUserId, input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
      expect(mockedApiClient.patch).toHaveBeenCalledWith(`/users/${nonExistentUserId}`, input);
    });

    it('handles validation error', async () => {
      const invalidInput = {
        email: 'invalid-email-format'
      };

      mockedApiClient.patch.mockResolvedValueOnce({
        data: null,
        error: 'Invalid email format',
        success: false
      });

      const result = await userService.updateUser(userId, invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('handles empty update input', async () => {
      const emptyInput = {};

      const mockResponse = {
        id: userId,
        auth_id: 'auth123',
        email: 'test@example.com',
        first_name: 'Original',
        last_name: 'Name'
      };

      mockedApiClient.patch.mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        success: true
      });

      const result = await userService.updateUser(userId, emptyInput);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockedApiClient.patch).toHaveBeenCalledWith(`/users/${userId}`, emptyInput);
    });
  });
}); 