import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';

export interface JwtPayload {
  sub: string; // Supabase user ID
  email: string;
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  role?: string;
  email_verified?: boolean;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
}

export interface AuthUser {
  id: string; // Our database user ID
  authId: string; // Supabase auth ID
  email: string;
  firstName: string;
  lastName: string;
  institution?: string;
  fieldOfStudy?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {
    // Get Supabase JWT secret for token verification
    const supabaseJwtSecret = configService.get<string>('SUPABASE_JWT_SECRET');
    
    if (!supabaseJwtSecret) {
      // Fallback to a default secret for development
      console.warn('⚠️ SUPABASE_JWT_SECRET not set, using default for development');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: supabaseJwtSecret || 'your-supabase-jwt-secret-here',
      audience: 'authenticated',
      issuer: configService.get<string>('SUPABASE_URL'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    try {
      // Verify the user exists and is authenticated
      if (!payload.sub || !payload.email) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Get user from our database using Supabase auth ID
      const userResponse = await this.databaseService.getUserByAuthId(payload.sub);

      if (!userResponse.success || !userResponse.data) {
        throw new UnauthorizedException('User not found in database');
      }

      const dbUser = userResponse.data;

      // Return user info that will be available in request.user
      return {
        id: dbUser.user_id,
        authId: payload.sub,
        email: dbUser.email,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        institution: dbUser.institution || undefined,
        fieldOfStudy: dbUser.field_of_study || undefined,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
