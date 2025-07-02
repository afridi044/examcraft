// Health Service - Backend API calls
import { apiClient } from '../api-client';
import type { ApiResponse } from '@/types';

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  database: 'connected' | 'disconnected';
}

export const healthService = {
  /**
   * Check backend health status
   */
  async checkHealth(): Promise<ApiResponse<HealthStatus>> {
    return apiClient.get<HealthStatus>('/health');
  },
}; 