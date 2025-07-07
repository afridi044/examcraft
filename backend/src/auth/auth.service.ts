import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SignInDto, SignUpDto, AuthResponseDto } from './dto/auth.dto';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabaseAdmin;

  constructor(private readonly databaseService: DatabaseService) {
    // Create client for server-side auth operations
    // Note: For production, use SUPABASE_SERVICE_ROLE_KEY instead of SUPABASE_ANON_KEY
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async signIn(signInDto: SignInDto): Promise<AuthResponseDto> {
    try {
      const { email, password } = signInDto;

      // Authenticate with Supabase
      const { data: authData, error: authError } =
        await this.supabaseAdmin.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        throw new UnauthorizedException(authError.message);
      }

      if (!authData.user || !authData.session) {
        throw new UnauthorizedException('Authentication failed');
      }

      // Debug: Log the auth user info
      console.log('🔍 Auth User Debug:', {
        id: authData.user.id,
        email: authData.user.email,
        email_confirmed_at: authData.user.email_confirmed_at,
        created_at: authData.user.created_at,
      });

      // Get user from our database
      const userResponse = await this.databaseService.getUserByAuthId(
        authData.user.id,
      );

      console.log('🔍 Database User Lookup:', {
        success: userResponse.success,
        userFound: !!userResponse.data,
        error: userResponse.error,
      });

      const user = userResponse.data;

      // For sign-in, user should already exist in database
      // TEMPORARY FIX: If user doesn't exist but is authenticated, create them
      if (!user) {
        console.log('⚠️ TEMPORARY FIX: Creating missing user record...');

        // Parse name from metadata or use defaults
        const fullName = authData.user.user_metadata?.full_name || 'User';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';

        const createUserResponse = await this.databaseService.createUser({
          supabase_auth_id: authData.user.id,
          email: authData.user.email || email,
          first_name: firstName,
          last_name: lastName,
        });

        if (!createUserResponse.success) {
          throw new UnauthorizedException(
            `Failed to create user record: ${createUserResponse.error}`,
          );
        }

        console.log('✅ User record created successfully');
        // Use the newly created user
        const newUser = createUserResponse.data;

        return {
          success: true,
          user: {
            id: newUser!.user_id,
            auth_id: authData.user.id,
            email: newUser!.email,
            first_name: newUser!.first_name,
            last_name: newUser!.last_name,
            full_name: `${newUser!.first_name} ${newUser!.last_name}`.trim(),
          },
          access_token: authData.session.access_token, // Return Supabase JWT
          refresh_token: authData.session.refresh_token,
          message: 'Sign in successful (user record created)',
        };
      }

      return {
        success: true,
        user: {
          id: user.user_id,
          auth_id: authData.user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          full_name: `${user.first_name} ${user.last_name}`.trim(),
        },
        access_token: authData.session.access_token, // Return Supabase JWT
        refresh_token: authData.session.refresh_token,
        message: 'Sign in successful',
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      console.error('Sign in error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async signUp(signUpDto: SignUpDto): Promise<AuthResponseDto> {
    try {
      const { email, password, full_name, institution, field_of_study } = signUpDto;

      // Create user in Supabase Auth
      const { data: authData, error: authError } =
        await this.supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Auto-confirm email for now
          user_metadata: {
            full_name: full_name || null,
          },
        });

      if (authError) {
        throw new BadRequestException(authError.message);
      }

      if (!authData.user) {
        throw new BadRequestException('Failed to create user');
      }

      // Parse full_name into first_name and last_name
      const nameParts = (full_name || '').split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Create user in our database with all fields
      const createUserResponse = await this.databaseService.createUser({
        supabase_auth_id: authData.user.id,
        email: authData.user.email || email,
        first_name: firstName,
        last_name: lastName,
        institution: institution || null,
        field_of_study: field_of_study || null,
      });

      if (!createUserResponse.success) {
        // If database creation fails, clean up auth user
        await this.supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw new BadRequestException('Failed to create user profile');
      }

      if (!createUserResponse.data) {
        throw new BadRequestException('Failed to create user profile');
      }

      // Sign in the user to get JWT tokens
      const { data: signInData, error: signInError } =
        await this.supabaseAdmin.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError || !signInData.session) {
        console.warn('⚠️ User created but could not generate tokens, user will need to sign in manually');
        return {
          success: true,
          user: {
            id: createUserResponse.data.user_id,
            auth_id: authData.user.id,
            email: createUserResponse.data.email,
            first_name: createUserResponse.data.first_name,
            last_name: createUserResponse.data.last_name,
            full_name:
              `${createUserResponse.data.first_name} ${createUserResponse.data.last_name}`.trim(),
          },
          message: 'Account created successfully, please sign in',
        };
      }

      return {
        success: true,
        user: {
          id: createUserResponse.data.user_id,
          auth_id: authData.user.id,
          email: createUserResponse.data.email,
          full_name:
            `${createUserResponse.data.first_name} ${createUserResponse.data.last_name}`.trim(),
        },
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
        message: 'Account created successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error('Sign up error:', error);
      throw new BadRequestException('Failed to create account');
    }
  }

  async signOut(): Promise<AuthResponseDto> {
    // Note: In a stateless backend, sign out is typically handled by the frontend
    // by removing the token. This endpoint is mainly for logging purposes.
    return {
      success: true,
      message: 'Signed out successfully',
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token is required');
      }

      // Use Supabase to refresh the token
      const { data, error } = await this.supabaseAdmin.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        throw new UnauthorizedException(error.message);
      }

      if (!data.session || !data.user) {
        throw new UnauthorizedException('Failed to refresh token');
      }

      // Get user from our database
      const userResponse = await this.databaseService.getUserByAuthId(data.user.id);

      if (!userResponse.success || !userResponse.data) {
        throw new UnauthorizedException('User not found in database');
      }

      const user = userResponse.data;

      return {
        success: true,
        user: {
          id: user.user_id,
          auth_id: data.user.id,
          email: user.email,
          full_name: `${user.first_name} ${user.last_name}`.trim(),
        },
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        message: 'Token refreshed successfully',
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      console.error('Token refresh error:', error);
      throw new UnauthorizedException('Token refresh failed');
    }
  }
}
