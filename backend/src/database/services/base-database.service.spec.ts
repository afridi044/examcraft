import { BaseDatabaseService } from './base-database.service';
import { ConfigService } from '@nestjs/config';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

const { createClient } = require('@supabase/supabase-js');

describe('BaseDatabaseService', () => {
  let service: BaseDatabaseService;
  let mockConfigService: any;
  let mockSupabase: any;
  let mockSupabaseAdmin: any;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn(),
    };
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };
    mockSupabaseAdmin = {};
    (createClient as jest.Mock).mockClear();
    (createClient as jest.Mock).mockReturnValueOnce(mockSupabase).mockReturnValueOnce(mockSupabaseAdmin);
    service = new BaseDatabaseService(mockConfigService);
  });

  describe('initializeClients', () => {
    it('should initialize clients with valid config', async () => {
      mockConfigService.get
        .mockReturnValueOnce('url') // supabase.url
        .mockReturnValueOnce('anon') // supabase.anonKey
        .mockReturnValueOnce('service'); // supabase.serviceRoleKey
      await service.initializeClients();
      expect(createClient).toHaveBeenCalledTimes(2);
      expect(service['supabase']).toBe(mockSupabase);
      expect(service['supabaseAdmin']).toBe(mockSupabaseAdmin);
    });

    it('should fallback to regular client if no service role key', async () => {
      mockConfigService.get
        .mockReturnValueOnce('url') // supabase.url
        .mockReturnValueOnce('anon') // supabase.anonKey
        .mockReturnValueOnce(undefined); // supabase.serviceRoleKey
      await service.initializeClients();
      expect(createClient).toHaveBeenCalledTimes(1);
      expect(service['supabaseAdmin']).toBe(service['supabase']);
    });

    it('should throw error if config missing', async () => {
      mockConfigService.get.mockReturnValueOnce(undefined); // supabase.url
      await expect(service.initializeClients()).rejects.toThrow('Supabase configuration is missing');
    });
  });

  describe('handleError', () => {
    it('should return standardized error response', () => {
      const error = new Error('fail');
      const result = service['handleError'](error, 'op');
      expect(result).toEqual({ success: false, data: null, error: 'fail' });
    });
    it('should handle unknown error', () => {
      const result = service['handleError']('oops', 'op');
      expect(result).toEqual({ success: false, data: null, error: 'Unknown error occurred' });
    });
  });

  describe('handleSuccess', () => {
    it('should return standardized success response', () => {
      const result = service['handleSuccess']({ foo: 'bar' });
      expect(result).toEqual({ success: true, data: { foo: 'bar' }, error: null });
    });
  });

  describe('checkHealth', () => {
    it('should return healthy if no error', async () => {
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.limit.mockResolvedValue({ error: null });
      service['supabase'] = mockSupabase;
      const result = await service.checkHealth();
      expect(result.status).toBe('healthy');
    });
    it('should return unhealthy if error', async () => {
      mockSupabase.from.mockReturnThis();
      mockSupabase.select.mockReturnThis();
      mockSupabase.limit.mockResolvedValue({ error: 'fail' });
      service['supabase'] = mockSupabase;
      const result = await service.checkHealth();
      expect(result.status).toBe('unhealthy');
    });
    it('should return unhealthy if exception thrown', async () => {
      service['supabase'] = { from: () => { throw new Error('fail'); } } as any;
      const result = await service.checkHealth();
      expect(result.status).toBe('unhealthy');
    });
  });
}); 