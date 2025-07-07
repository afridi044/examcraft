import { UserDatabaseService } from '../services/user-database.service';
import { TABLE_NAMES } from '../../types/shared.types';

describe('UserDatabaseService', () => {
  let service: UserDatabaseService;
  let supabase: any;
  let supabaseAdmin: any;
  let mockLogger: any;
  let mockConfigService: any;

  beforeEach(() => {
    supabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      rpc: jest.fn().mockReturnThis(),
    };
    supabaseAdmin = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
    };
    mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };
    mockConfigService = { get: jest.fn() };
    service = new UserDatabaseService(mockConfigService as any);
    (service as any).supabase = supabase;
    (service as any).supabaseAdmin = supabaseAdmin;
    (service as any).logger = mockLogger;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should return current user successfully', async () => {
      const authUserId = 'auth-123';
      const mockUser = {
        user_id: 'user-123',
        supabase_auth_id: authUserId,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
      };

      supabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: mockUser,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getCurrentUser(authUserId);

      expect(supabaseAdmin.from).toHaveBeenCalledWith(TABLE_NAMES.USERS);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
    });

    it('should return null when user not found (PGRST116 error)', async () => {
      const authUserId = 'auth-123';
      const mockError = { code: 'PGRST116', message: 'No rows returned' };

      supabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await service.getCurrentUser(authUserId);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle database error', async () => {
      const authUserId = 'auth-123';
      const mockError = { message: 'Database error' };

      supabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await service.getCurrentUser(authUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle exception', async () => {
      const authUserId = 'auth-123';

      supabaseAdmin.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await service.getCurrentUser(authUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getUserByAuthId', () => {
    it('should return user by auth ID successfully', async () => {
      const authUserId = 'auth-123';
      const mockUser = {
        user_id: 'user-123',
        supabase_auth_id: authUserId,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
      };

      supabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: mockUser,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getUserByAuthId(authUserId);

      expect(supabaseAdmin.from).toHaveBeenCalledWith(TABLE_NAMES.USERS);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
    });

    it('should return null when user not found (PGRST116 error)', async () => {
      const authUserId = 'auth-123';
      const mockError = { code: 'PGRST116', message: 'No rows returned' };

      supabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await service.getUserByAuthId(authUserId);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle database error', async () => {
      const authUserId = 'auth-123';
      const mockError = { message: 'Database error' };

      supabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await service.getUserByAuthId(authUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle exception', async () => {
      const authUserId = 'auth-123';

      supabaseAdmin.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await service.getUserByAuthId(authUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getUserById', () => {
    it('should return user by ID successfully', async () => {
      const userId = 'user-123';
      const mockUser = {
        user_id: userId,
        supabase_auth_id: 'auth-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
      };

      supabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: mockUser,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getUserById(userId);

      expect(supabaseAdmin.from).toHaveBeenCalledWith(TABLE_NAMES.USERS);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
    });

    it('should handle database error', async () => {
      const userId = 'user-123';
      const mockError = { message: 'User not found' };

      supabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await service.getUserById(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle exception', async () => {
      const userId = 'user-123';

      supabaseAdmin.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await service.getUserById(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('createUser', () => {
    it('should create user successfully with password_hash', async () => {
      const userInput = {
        supabase_auth_id: 'auth-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        password_hash: 'hashed_password_123',
      };
      const mockCreatedUser = {
        user_id: 'user-123',
        ...userInput,
        created_at: '2024-01-01T00:00:00Z',
      };

      supabaseAdmin.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: mockCreatedUser,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.createUser(userInput);

      expect(supabaseAdmin.from).toHaveBeenCalledWith(TABLE_NAMES.USERS);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedUser);
    });

    it('should create user successfully without password_hash', async () => {
      const userInput = {
        supabase_auth_id: 'auth-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
      };
      const mockCreatedUser = {
        user_id: 'user-123',
        ...userInput,
        password_hash: '',
        created_at: '2024-01-01T00:00:00Z',
      };

      supabaseAdmin.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: mockCreatedUser,
              error: null,
            }),
          }),
        }),
      });

      const result = await service.createUser(userInput);

      expect(supabaseAdmin.from).toHaveBeenCalledWith(TABLE_NAMES.USERS);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedUser);
    });

    it('should handle database error', async () => {
      const userInput = {
        supabase_auth_id: 'auth-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
      };
      const mockError = { message: 'User creation failed' };

      supabaseAdmin.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValueOnce({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      const result = await service.createUser(userInput);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle exception', async () => {
      const userInput = {
        supabase_auth_id: 'auth-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
      };

      supabaseAdmin.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await service.createUser(userInput);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'user-123';
      const updateInput = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
      };
      const mockUpdatedUser = {
        user_id: userId,
        ...updateInput,
        updated_at: '2024-01-01T00:00:00Z',
      };

      supabaseAdmin.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
              single: jest.fn().mockResolvedValueOnce({
                data: mockUpdatedUser,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.updateUser(userId, updateInput);

      expect(supabaseAdmin.from).toHaveBeenCalledWith(TABLE_NAMES.USERS);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedUser);
    });

    it('should handle database error', async () => {
      const userId = 'user-123';
      const updateInput = {
        first_name: 'Jane',
        last_name: 'Smith',
      };
      const mockError = { message: 'Update failed' };

      supabaseAdmin.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            select: jest.fn().mockReturnValueOnce({
              single: jest.fn().mockResolvedValueOnce({
                data: null,
                error: mockError,
              }),
            }),
          }),
        }),
      });

      const result = await service.updateUser(userId, updateInput);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle exception', async () => {
      const userId = 'user-123';
      const updateInput = {
        first_name: 'Jane',
        last_name: 'Smith',
      };

      supabaseAdmin.from.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await service.updateUser(userId, updateInput);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
}); 