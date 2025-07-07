import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private databaseService: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    
    // Check for session-based auth (user ID in headers or cookies)
    const userId = request.headers['x-user-id'] || request.cookies?.userId;
    
    if (!userId) {
      throw new UnauthorizedException('No user session found');
    }

    // Get user from database to verify session is valid
    const userResponse = await this.databaseService.getUserById(userId);
    
    if (!userResponse.success || !userResponse.data) {
      throw new UnauthorizedException('Invalid user session');
    }

    // Attach user to request
    request.user = {
      id: userResponse.data.user_id,
      authId: userResponse.data.supabase_auth_id,
      email: userResponse.data.email,
      firstName: userResponse.data.first_name,
      lastName: userResponse.data.last_name,
      institution: userResponse.data.institution,
      fieldOfStudy: userResponse.data.field_of_study,
    };

    return true;
  }
}
