import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseService } from '../database/database.service';
import { SignInDto, SignUpDto } from './dto/auth.dto';

// Mock Supabase client
const mockSupabaseAuth = {
  signInWithPassword: jest.fn(),
};

const mockSupabaseAdminAuth = {
  createUser: jest.fn(),
  deleteUser: jest.fn(),
};

const mockSupabaseAdmin = {
  auth: {
    ...mockSupabaseAuth,
    admin: mockSupabaseAdminAuth,
  },
};

// Mock the createClient function
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseAdmin),
}));

describe('AuthService', () => {
  let service: AuthService;
  let databaseService: jest.Mocked<DatabaseService>;

  // Mock environment variables
  const originalEnv = process.env;

  beforeEach(async () => {
    // Set up environment variables for testing
    process.env = {
      ...originalEnv,
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DatabaseService,
          useValue: {
            getUserByAuthId: jest.fn(),
            createUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    databaseService = module.get(DatabaseService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    const mockSignInDto: SignInDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockAuthUser = {
      id: 'auth-user-id-123',
      email: 'test@example.com',
      email_confirmed_at: '2023-01-01T00:00:00Z',
      created_at: '2023-01-01T00:00:00Z',
      user_metadata: {
        full_name: 'John Doe',
      },
    };

    const mockDatabaseUser = {
      user_id: 'db-user-id-456',
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      password_hash: 'hashed-password',
      supabase_auth_id: 'auth-user-id-123',
      institution: null,
      field_of_study: null,
      last_login: null,
    };

    describe('successful sign in with existing user', () => {
      it('should sign in successfully when user exists in database', async () => {
        // Arrange
        const mockAuthResponse = {
          data: { user: mockAuthUser },
          error: null,
        };

        const mockDatabaseResponse = {
          success: true,
          data: mockDatabaseUser,
          error: null,
        };

        mockSupabaseAuth.signInWithPassword.mockResolvedValue(mockAuthResponse);
        databaseService.getUserByAuthId.mockResolvedValue(mockDatabaseResponse);

        // Act
        const result = await service.signIn(mockSignInDto);

        // Assert
        expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
          email: mockSignInDto.email,
          password: mockSignInDto.password,
        });

        expect(databaseService.getUserByAuthId).toHaveBeenCalledWith(
          mockAuthUser.id,
        );

        expect(result).toEqual({
          success: true,
          user: {
            id: mockDatabaseUser.user_id,
            auth_id: mockAuthUser.id,
            email: mockDatabaseUser.email,
            full_name: 'John Doe',
          },
          message: 'Sign in successful',
        });
      });
    });

    describe('successful sign in with missing user (temporary fix)', () => {
      it('should create user record when authenticated but not in database', async () => {
        // Arrange
        const mockAuthResponse = {
          data: { user: mockAuthUser },
          error: null,
        };

        const mockDatabaseLookupResponse = {
          success: true,
          data: null, // User not found in database
          error: null,
        };

        const mockCreateUserResponse = {
          success: true,
          data: mockDatabaseUser,
          error: null,
        };

        mockSupabaseAuth.signInWithPassword.mockResolvedValue(mockAuthResponse);
        databaseService.getUserByAuthId.mockResolvedValue(mockDatabaseLookupResponse);
        databaseService.createUser.mockResolvedValue(mockCreateUserResponse);

        // Act
        const result = await service.signIn(mockSignInDto);

        // Assert
        expect(databaseService.getUserByAuthId).toHaveBeenCalledWith(
          mockAuthUser.id,
        );

        expect(databaseService.createUser).toHaveBeenCalledWith({
          supabase_auth_id: mockAuthUser.id,
          email: mockAuthUser.email,
          first_name: 'John',
          last_name: 'Doe',
        });

        expect(result).toEqual({
          success: true,
          user: {
            id: mockDatabaseUser.user_id,
            auth_id: mockAuthUser.id,
            email: mockDatabaseUser.email,
            full_name: 'John Doe',
          },
          message: 'Sign in successful (user record created)',
        });
      });

      it('should handle user creation with default name when metadata is missing', async () => {
        // Arrange
        const mockAuthUserWithoutName = {
          ...mockAuthUser,
          user_metadata: {},
        };

        const mockAuthResponse = {
          data: { user: mockAuthUserWithoutName },
          error: null,
        };

        const mockDatabaseLookupResponse = {
          success: true,
          data: null,
          error: null,
        };

        const mockCreateUserResponse = {
          success: true,
          data: {
            ...mockDatabaseUser,
            first_name: 'User',
            last_name: '',
          },
          error: null,
        };

        mockSupabaseAuth.signInWithPassword.mockResolvedValue(mockAuthResponse);
        databaseService.getUserByAuthId.mockResolvedValue(mockDatabaseLookupResponse);
        databaseService.createUser.mockResolvedValue(mockCreateUserResponse);

        // Act
        const result = await service.signIn(mockSignInDto);

        // Assert
        expect(databaseService.createUser).toHaveBeenCalledWith({
          supabase_auth_id: mockAuthUser.id,
          email: mockAuthUser.email,
          first_name: 'User',
          last_name: '',
        });

        expect(result.user?.full_name).toBe('User');
      });
    });

    describe('authentication failures', () => {
      it('should throw UnauthorizedException when Supabase authentication fails', async () => {
        // Arrange
        const mockAuthResponse = {
          data: { user: null },
          error: { message: 'Invalid credentials' },
        };

        mockSupabaseAuth.signInWithPassword.mockResolvedValue(mockAuthResponse);

        // Act & Assert
        await expect(service.signIn(mockSignInDto)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.signIn(mockSignInDto)).rejects.toThrow(
          'Invalid credentials',
        );
      });

      it('should throw UnauthorizedException when no user data returned from Supabase', async () => {
        // Arrange
        const mockAuthResponse = {
          data: { user: null },
          error: null,
        };

        mockSupabaseAuth.signInWithPassword.mockResolvedValue(mockAuthResponse);

        // Act & Assert
        await expect(service.signIn(mockSignInDto)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.signIn(mockSignInDto)).rejects.toThrow(
          'Authentication failed',
        );
      });

      it('should throw UnauthorizedException when user creation fails', async () => {
        // Arrange
        const mockAuthResponse = {
          data: { user: mockAuthUser },
          error: null,
        };

        const mockDatabaseLookupResponse = {
          success: true,
          data: null,
          error: null,
        };

        const mockCreateUserResponse = {
          success: false,
          data: null,
          error: 'Database connection failed',
        };

        mockSupabaseAuth.signInWithPassword.mockResolvedValue(mockAuthResponse);
        databaseService.getUserByAuthId.mockResolvedValue(mockDatabaseLookupResponse);
        databaseService.createUser.mockResolvedValue(mockCreateUserResponse);

        // Act & Assert
        await expect(service.signIn(mockSignInDto)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.signIn(mockSignInDto)).rejects.toThrow(
          'Failed to create user record: Database connection failed',
        );
      });
    });

    describe('database service failures', () => {
      it('should throw UnauthorizedException when database lookup fails', async () => {
        // Arrange
        const mockAuthResponse = {
          data: { user: mockAuthUser },
          error: null,
        };

        const mockDatabaseResponse = {
          success: false,
          data: null,
          error: 'Database error',
        };

        mockSupabaseAuth.signInWithPassword.mockResolvedValue(mockAuthResponse);
        databaseService.getUserByAuthId.mockResolvedValue(mockDatabaseResponse);

        // Act & Assert
        await expect(service.signIn(mockSignInDto)).rejects.toThrow(
          UnauthorizedException,
        );
      });
    });

    describe('error handling', () => {
      it('should handle unexpected errors and throw UnauthorizedException', async () => {
        // Arrange
        mockSupabaseAuth.signInWithPassword.mockRejectedValue(
          new Error('Network error'),
        );

        // Act & Assert
        await expect(service.signIn(mockSignInDto)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.signIn(mockSignInDto)).rejects.toThrow(
          'Authentication failed',
        );
      });

      it('should preserve UnauthorizedException and BadRequestException', async () => {
        // Arrange
        mockSupabaseAuth.signInWithPassword.mockRejectedValue(
          new UnauthorizedException('Custom auth error'),
        );

        // Act & Assert
        await expect(service.signIn(mockSignInDto)).rejects.toThrow(
          UnauthorizedException,
        );
        await expect(service.signIn(mockSignInDto)).rejects.toThrow(
          'Custom auth error',
        );
      });
    });
  });

  describe('signUp', () => {
    const mockSignUpDto: SignUpDto = {
      email: 'newuser@example.com',
      password: 'password123',
      full_name: 'Jane Smith',
      institution: 'University of Technology',
      field_of_study: 'Computer Science',
    };

    const mockAuthUser = {
      id: 'new-auth-user-id-789',
      email: 'newuser@example.com',
      email_confirmed_at: '2023-01-01T00:00:00Z',
      created_at: '2023-01-01T00:00:00Z',
      user_metadata: {
        full_name: 'Jane Smith',
      },
    };

    const mockDatabaseUser = {
      user_id: 'new-db-user-id-101',
      email: 'newuser@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      password_hash: 'hashed-password',
      supabase_auth_id: 'new-auth-user-id-789',
      institution: 'University of Technology',
      field_of_study: 'Computer Science',
      last_login: null,
    };

    describe('successful sign up', () => {
      it('should create user successfully with all fields', async () => {
        // Arrange
        const mockAuthResponse = {
          data: { user: mockAuthUser },
          error: null,
        };

        const mockCreateUserResponse = {
          success: true,
          data: mockDatabaseUser,
          error: null,
        };

        mockSupabaseAdminAuth.createUser.mockResolvedValue(mockAuthResponse);
        databaseService.createUser.mockResolvedValue(mockCreateUserResponse);

        // Act
        const result = await service.signUp(mockSignUpDto);

        // Assert
        expect(mockSupabaseAdminAuth.createUser).toHaveBeenCalledWith({
          email: mockSignUpDto.email,
          password: mockSignUpDto.password,
          email_confirm: true,
          user_metadata: {
            full_name: mockSignUpDto.full_name,
          },
        });

        expect(databaseService.createUser).toHaveBeenCalledWith({
          supabase_auth_id: mockAuthUser.id,
          email: mockAuthUser.email,
          first_name: 'Jane',
          last_name: 'Smith',
          institution: mockSignUpDto.institution,
          field_of_study: mockSignUpDto.field_of_study,
        });

        expect(result).toEqual({
          success: true,
          user: {
            id: mockDatabaseUser.user_id,
            auth_id: mockAuthUser.id,
            email: mockDatabaseUser.email,
            full_name: 'Jane Smith',
          },
          message: 'Account created successfully',
        });
      });

      it('should handle sign up with minimal required fields', async () => {
        // Arrange
        const minimalSignUpDto: SignUpDto = {
          email: 'minimal@example.com',
          password: 'password123',
        };

        const mockAuthUserMinimal = {
          ...mockAuthUser,
          email: 'minimal@example.com',
          user_metadata: {},
        };

        const mockDatabaseUserMinimal = {
          ...mockDatabaseUser,
          email: 'minimal@example.com',
          first_name: 'User',
          last_name: '',
          institution: null,
          field_of_study: null,
        };

        const mockAuthResponse = {
          data: { user: mockAuthUserMinimal },
          error: null,
        };

        const mockCreateUserResponse = {
          success: true,
          data: mockDatabaseUserMinimal,
          error: null,
        };

        mockSupabaseAdminAuth.createUser.mockResolvedValue(mockAuthResponse);
        databaseService.createUser.mockResolvedValue(mockCreateUserResponse);

        // Act
        const result = await service.signUp(minimalSignUpDto);

        // Assert
                 expect(mockSupabaseAdminAuth.createUser).toHaveBeenCalledWith({
           email: minimalSignUpDto.email,
           password: minimalSignUpDto.password,
           email_confirm: true,
           user_metadata: {
             full_name: null,
           },
         });

        expect(databaseService.createUser).toHaveBeenCalledWith({
          supabase_auth_id: mockAuthUserMinimal.id,
          email: mockAuthUserMinimal.email,
          first_name: 'User',
          last_name: '',
          institution: null,
          field_of_study: null,
        });

        expect(result.user?.full_name).toBe('User');
      });

      it('should handle name parsing with single name', async () => {
        // Arrange
        const singleNameSignUpDto: SignUpDto = {
          email: 'single@example.com',
          password: 'password123',
          full_name: 'John',
        };

        const mockAuthUserSingle = {
          ...mockAuthUser,
          email: 'single@example.com',
          user_metadata: { full_name: 'John' },
        };

        const mockDatabaseUserSingle = {
          ...mockDatabaseUser,
          email: 'single@example.com',
          first_name: 'John',
          last_name: '',
        };

        const mockAuthResponse = {
          data: { user: mockAuthUserSingle },
          error: null,
        };

        const mockCreateUserResponse = {
          success: true,
          data: mockDatabaseUserSingle,
          error: null,
        };

        mockSupabaseAdminAuth.createUser.mockResolvedValue(mockAuthResponse);
        databaseService.createUser.mockResolvedValue(mockCreateUserResponse);

        // Act
        const result = await service.signUp(singleNameSignUpDto);

        // Assert
        expect(databaseService.createUser).toHaveBeenCalledWith({
          supabase_auth_id: mockAuthUserSingle.id,
          email: mockAuthUserSingle.email,
          first_name: 'John',
          last_name: '',
          institution: null,
          field_of_study: null,
        });

        expect(result.user?.full_name).toBe('John');
      });
    });

    describe('authentication failures', () => {
      it('should throw BadRequestException when Supabase user creation fails', async () => {
        // Arrange
        const mockAuthResponse = {
          data: { user: null },
          error: { message: 'Email already exists' },
        };

        mockSupabaseAdminAuth.createUser.mockResolvedValue(mockAuthResponse);

        // Act & Assert
        await expect(service.signUp(mockSignUpDto)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.signUp(mockSignUpDto)).rejects.toThrow(
          'Email already exists',
        );
      });

      it('should throw BadRequestException when no user data returned from Supabase', async () => {
        // Arrange
        const mockAuthResponse = {
          data: { user: null },
          error: null,
        };

        mockSupabaseAdminAuth.createUser.mockResolvedValue(mockAuthResponse);

        // Act & Assert
        await expect(service.signUp(mockSignUpDto)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.signUp(mockSignUpDto)).rejects.toThrow(
          'Failed to create user',
        );
      });
    });

    describe('database creation failures', () => {
      it('should clean up auth user and throw BadRequestException when database creation fails', async () => {
        // Arrange
        const mockAuthResponse = {
          data: { user: mockAuthUser },
          error: null,
        };

        const mockCreateUserResponse = {
          success: false,
          data: null,
          error: 'Database connection failed',
        };

        mockSupabaseAdminAuth.createUser.mockResolvedValue(mockAuthResponse);
        mockSupabaseAdminAuth.deleteUser.mockResolvedValue({ error: null });
        databaseService.createUser.mockResolvedValue(mockCreateUserResponse);

        // Act & Assert
        await expect(service.signUp(mockSignUpDto)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.signUp(mockSignUpDto)).rejects.toThrow(
          'Failed to create user profile',
        );

        // Verify cleanup was called
        expect(mockSupabaseAdminAuth.deleteUser).toHaveBeenCalledWith(
          mockAuthUser.id,
        );
      });

      it('should throw BadRequestException when database returns null data', async () => {
        // Arrange
        const mockAuthResponse = {
          data: { user: mockAuthUser },
          error: null,
        };

        const mockCreateUserResponse = {
          success: true,
          data: null,
          error: null,
        };

        mockSupabaseAdminAuth.createUser.mockResolvedValue(mockAuthResponse);
        databaseService.createUser.mockResolvedValue(mockCreateUserResponse);

        // Act & Assert
        await expect(service.signUp(mockSignUpDto)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.signUp(mockSignUpDto)).rejects.toThrow(
          'Failed to create user profile',
        );

        // Note: The service doesn't call deleteUser when success is true but data is null
        // It only calls deleteUser when success is false
        expect(mockSupabaseAdminAuth.deleteUser).not.toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      it('should handle unexpected errors and throw BadRequestException', async () => {
        // Arrange
        mockSupabaseAdminAuth.createUser.mockRejectedValue(
          new Error('Network error'),
        );

        // Act & Assert
        await expect(service.signUp(mockSignUpDto)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.signUp(mockSignUpDto)).rejects.toThrow(
          'Failed to create account',
        );
      });

      it('should preserve BadRequestException', async () => {
        // Arrange
        mockSupabaseAdminAuth.createUser.mockRejectedValue(
          new BadRequestException('Custom signup error'),
        );

        // Act & Assert
        await expect(service.signUp(mockSignUpDto)).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.signUp(mockSignUpDto)).rejects.toThrow(
          'Custom signup error',
        );
      });
    });
  });

  describe('signOut', () => {
    it('should return successful sign out response', async () => {
      // Act
      const result = await service.signOut();

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Signed out successfully',
      });
    });

    it('should not require any external dependencies', async () => {
      // Act
      const result = await service.signOut();

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Signed out successfully');
      expect(result.user).toBeUndefined();
    });
  });
});
