import { Injectable } from '@nestjs/common';
import { BaseDatabaseService } from './base-database.service';
import {
  ApiResponse,
  TABLE_NAMES,
  UserRow,
  TablesInsert,
  TablesUpdate,
} from '../../types/shared.types';

@Injectable()
export class UserDatabaseService extends BaseDatabaseService {
  
  async getCurrentUser(
    authUserId: string,
  ): Promise<ApiResponse<UserRow | null>> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.USERS)
        .select('*')
        .eq('supabase_auth_id', authUserId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No user found
          return this.handleSuccess(null);
        }
        return this.handleError(error, 'getCurrentUser');
      }

      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'getCurrentUser');
    }
  }

  async getUserByAuthId(
    authUserId: string,
  ): Promise<ApiResponse<UserRow | null>> {
    try {
      // Use admin client to bypass RLS policies for user lookup
      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.USERS)
        .select('*')
        .eq('supabase_auth_id', authUserId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No user found
          return this.handleSuccess(null);
        }
        return this.handleError(error, 'getUserByAuthId');
      }

      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'getUserByAuthId');
    }
  }

  async getUserById(userId: string): Promise<ApiResponse<UserRow>> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.USERS)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) return this.handleError(error, 'getUserById');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'getUserById');
    }
  }

  async createUser(
    input: Omit<TablesInsert<'users'>, 'password_hash'>,
  ): Promise<ApiResponse<UserRow>> {
    try {
      // Use admin client to bypass RLS policies for user creation
      // Don't include password_hash since we use Supabase Auth
      const payload = input as TablesInsert<'users'>;

      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.USERS)
        .insert(payload)
        .select()
        .single();

      if (error) return this.handleError(error, 'createUser');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'createUser');
    }
  }

  async updateUser(
    userId: string,
    input: TablesUpdate<'users'>,
  ): Promise<ApiResponse<UserRow>> {
    try {
      const { data, error } = await this.supabaseAdmin
        .from(TABLE_NAMES.USERS)
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) return this.handleError(error, 'updateUser');
      return this.handleSuccess(data);
    } catch (error) {
      return this.handleError(error, 'updateUser');
    }
  }
}
