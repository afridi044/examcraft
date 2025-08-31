import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ApiResponse, Database } from '../../types/shared.types';

@Injectable()
export class BaseDatabaseService {
  protected readonly logger = new Logger(BaseDatabaseService.name);
  protected supabase: SupabaseClient<Database>;
  protected supabaseAdmin: SupabaseClient<Database>;

  constructor(protected configService: ConfigService) {}

  async initializeClients() {
    // Debug logging
    this.logger.log('🔍 Environment Debug:');
    this.logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    this.logger.log(
      `SUPABASE_URL: ${process.env.SUPABASE_URL ? '[SET]' : '[NOT SET]'}`,
    );
    this.logger.log(
      `NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '[SET]' : '[NOT SET]'}`,
    );
    this.logger.log(
      `SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '[SET]' : '[NOT SET]'}`,
    );
    this.logger.log(
      `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[SET]' : '[NOT SET]'}`,
    );
    this.logger.log(
      `SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '[SET]' : '[NOT SET]'}`,
    );

    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseKey = this.configService.get<string>('supabase.anonKey');
    const supabaseServiceKey = this.configService.get<string>(
      'supabase.serviceRoleKey',
    );

    this.logger.log(`🔧 Config Service Results:`);
    this.logger.log(`supabase.url: ${supabaseUrl ? '[FOUND]' : '[NOT FOUND]'}`);
    this.logger.log(
      `supabase.anonKey: ${supabaseKey ? '[FOUND]' : '[NOT FOUND]'}`,
    );
    this.logger.log(
      `supabase.serviceRoleKey: ${supabaseServiceKey ? '[FOUND]' : '[NOT FOUND]'}`,
    );

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error('Supabase configuration is missing');
      throw new Error('Supabase configuration is missing');
    }

    // Initialize regular client with anon key
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    // Initialize admin client with service role key (if available)
    if (supabaseServiceKey) {
      this.supabaseAdmin = createClient<Database>(
        supabaseUrl,
        supabaseServiceKey,
        {
          auth: {
            persistSession: false,
          },
        },
      );
      this.logger.log('✅ Supabase admin client initialized successfully');
    } else {
      this.logger.warn(
        '⚠️ Service role key not found - admin operations may fail due to RLS',
      );
      // Fallback to regular client for backward compatibility
      this.supabaseAdmin = this.supabase;
    }

    this.logger.log('✅ Supabase clients initialized successfully');
  }

  protected handleError<T>(error: unknown, operation: string): ApiResponse<T> {
    this.logger.error(`❌ ${operation} failed:`, error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }

  protected handleSuccess<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
      error: null,
    };
  }

  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    try {
      // Test a simple query to Supabase using admin client to bypass RLS
      const { error } = await this.supabaseAdmin
        .from('users')
        .select('user_id')
        .limit(1);

      if (error) {
        this.logger.error('❌ Health check failed:', error);
        return {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('❌ Health check exception:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
