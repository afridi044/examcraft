import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  ApiResponse,
  DashboardStats,
  RecentActivity,
  TopicProgress,
} from '../types/shared.types';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private databaseService: DatabaseService) { }

  /**
   * Get dashboard statistics for a user
   */
  async getDashboardStats(
    userId: string,
  ): Promise<ApiResponse<DashboardStats>> {
    this.logger.log(`📊 Getting dashboard stats for user: ${userId}`);
    return this.databaseService.getDashboardStats(userId);
  }

  /**
   * Get recent activity for a user
   */
  async getRecentActivity(
    userId: string,
    limit: number = 10,
  ): Promise<ApiResponse<RecentActivity[]>> {
    this.logger.log(
      `🔄 Getting recent activity for user: ${userId} (limit: ${limit})`,
    );
    return this.databaseService.getRecentActivity(userId, limit);
  }

  /**
   * Get topic progress for a user
   */
  async getTopicProgress(
    userId: string,
  ): Promise<ApiResponse<TopicProgress[]>> {
    this.logger.log(`📈 Getting topic progress for user: ${userId}`);
    return this.databaseService.getTopicProgress(userId);
  }

  /**
   * Get all dashboard data in a single optimized call
   */
  async getAllDashboardData(userId: string): Promise<
    ApiResponse<{
      stats: DashboardStats;
      recentActivity: RecentActivity[];
      topicProgress: TopicProgress[];
    }>
  > {
    this.logger.log(`🚀 Getting all dashboard data for user: ${userId}`);
    return this.databaseService.getAllDashboardData(userId);
  }

  // =============================================
  // LAB EXAM TEMPLATE SERVICE METHOD - TOPICS
  // =============================================
  // This method fetches all topics from the database

  async getLabExamData(
    filters?: {
      limit?: number;
    },
  ): Promise<ApiResponse<any[]>> {
    this.logger.log(`🧪 Getting topics data`, filters);
    return this.databaseService.getLabExamData(filters);
  }

  // =============================================
  // LAB EXAM TEMPLATE SERVICE METHOD - CREATE TOPIC
  // =============================================
  // This method creates a new topic in the database

  async createLabExamData(
    topicData: { name: string; description?: string },
  ): Promise<ApiResponse<any>> {
    this.logger.log(`🧪 Creating new topic: ${topicData.name}`);
    return this.databaseService.createLabExamData(topicData);
  }
}
