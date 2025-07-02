import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type {
  ApiResponse,
  CreateUserInput,
  UpdateUserInput,
} from '../types/shared.types';
import type { Tables } from '../types/supabase.generated';

type UserRow = Tables<'users'>;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly db: DatabaseService) {}

  getCurrentUser(authId: string): Promise<ApiResponse<UserRow | null>> {
    return this.db.getCurrentUser(authId);
  }

  getById(id: string): Promise<ApiResponse<UserRow>> {
    return this.db.getUserById(id);
  }

  create(input: CreateUserInput): Promise<ApiResponse<UserRow>> {
    return this.db.createUser(input);
  }

  update(id: string, input: UpdateUserInput): Promise<ApiResponse<UserRow>> {
    return this.db.updateUser(id, input);
  }
}
