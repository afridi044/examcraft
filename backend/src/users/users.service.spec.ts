import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from '../database/database.service';
import type {
  ApiResponse,
  CreateUserInput,
  UpdateUserInput,
} from '../types/shared.types';
import type { Tables } from '../types/supabase.generated';

type UserRow = Tables<'users'>;

describe('UsersService', () => {
  let service: UsersService;
  let db: jest.Mocked<DatabaseService>;

  const mockUser: UserRow = {
    user_id: 'user-123',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    password_hash: 'hashed',
    supabase_auth_id: 'auth-123',
    institution: 'Test University',
    field_of_study: 'CS',
    last_login: null,
  };

  const mockApiResponse: ApiResponse<UserRow> = {
    success: true,
    data: mockUser,
    error: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DatabaseService,
          useValue: {
            getCurrentUser: jest.fn(),
            getUserById: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    db = module.get(DatabaseService);
  });

  describe('getCurrentUser', () => {
    it('should return user when found', async () => {
      (db.getCurrentUser as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUser,
        error: null,
      });
      const result = await service.getCurrentUser('auth-123');
      expect(db.getCurrentUser).toHaveBeenCalledWith('auth-123');
      expect(result.data).toEqual(mockUser);
      expect(result.success).toBe(true);
    });

    it('should return null when user not found', async () => {
      (db.getCurrentUser as jest.Mock).mockResolvedValue({
        success: true,
        data: null,
        error: null,
      });
      const result = await service.getCurrentUser('auth-999');
      expect(result.data).toBeNull();
      expect(result.success).toBe(true);
    });

    it('should handle errors', async () => {
      (db.getCurrentUser as jest.Mock).mockResolvedValue({
        success: false,
        data: null,
        error: 'Database error',
      });
      const result = await service.getCurrentUser('auth-err');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getById', () => {
    it('should return user by id', async () => {
      (db.getUserById as jest.Mock).mockResolvedValue(mockApiResponse);
      const result = await service.getById('user-123');
      expect(db.getUserById).toHaveBeenCalledWith('user-123');
      expect(result.data).toEqual(mockUser);
    });

    it('should handle errors', async () => {
      (db.getUserById as jest.Mock).mockResolvedValue({
        success: false,
        data: null,
        error: 'Not found',
      });
      const result = await service.getById('user-404');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const input: CreateUserInput = {
        email: 'new@example.com',
        first_name: 'New',
        last_name: 'User',
        password_hash: 'pw',
        institution: 'Test U',
        field_of_study: 'Math',
        supabase_auth_id: 'auth-new',
      };
      (db.createUser as jest.Mock).mockResolvedValue({
        success: true,
        data: { ...mockUser, ...input, user_id: 'user-new' },
        error: null,
      });
      const result = await service.create(input);
      expect(db.createUser).toHaveBeenCalledWith(input);
      expect(result.data?.email).toBe('new@example.com');
      expect(result.success).toBe(true);
    });

    it('should handle creation errors', async () => {
      const input: CreateUserInput = {
        email: 'fail@example.com',
        first_name: 'Fail',
        last_name: 'User',
        password_hash: 'pw',
        institution: 'Test U',
        field_of_study: 'Math',
        supabase_auth_id: 'auth-fail',
      };
      (db.createUser as jest.Mock).mockResolvedValue({
        success: false,
        data: null,
        error: 'Duplicate email',
      });
      const result = await service.create(input);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Duplicate email');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const input: UpdateUserInput = {
        first_name: 'Updated',
        last_name: 'User',
      };
      (db.updateUser as jest.Mock).mockResolvedValue({
        success: true,
        data: { ...mockUser, ...input },
        error: null,
      });
      const result = await service.update('user-123', input);
      expect(db.updateUser).toHaveBeenCalledWith('user-123', input);
      expect(result.data?.first_name).toBe('Updated');
      expect(result.success).toBe(true);
    });

    it('should handle update errors', async () => {
      const input: UpdateUserInput = {
        first_name: 'Fail',
      };
      (db.updateUser as jest.Mock).mockResolvedValue({
        success: false,
        data: null,
        error: 'Update failed',
      });
      const result = await service.update('user-123', input);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });
}); 