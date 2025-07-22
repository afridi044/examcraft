import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';
import { Request } from 'express';

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
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    
    if (!supabaseJwtSecret) {
      throw new Error('SUPABASE_JWT_SECRET is required for JWT authentication');
    }

    super({
      jwtFromRequest: (req: Request) => {
        // First try to get token from Authorization header (for backward compatibility)
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          return authHeader.substring(7);
        }
        
        // Then try to get token from cookies
        const token = req.cookies?.access_token;
        return token || null;
      },
      ignoreExpiration: false,
      secretOrKey: supabaseJwtSecret,
      // ✅ Now using the CORRECT Supabase issuer format
      audience: 'authenticated',
      issuer: `${supabaseUrl}/auth/v1`,  // Supabase uses /auth/v1 suffix
      algorithms: ['HS256'], // Supabase uses HS256
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
