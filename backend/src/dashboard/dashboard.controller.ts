import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import {
  ApiResponse as CustomApiResponse,
  DashboardStats,
  RecentActivity,
  TopicProgress,
} from '../types/shared.types';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private dashboardService: DashboardService) {}

  @Get('stats/:userId')
  @ApiOperation({ summary: 'Get dashboard statistics for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getDashboardStats(
    @Param('userId') userId: string,
  ): Promise<CustomApiResponse<DashboardStats>> {
    this.logger.log(`📊 Dashboard stats requested for user: ${userId}`);
    return this.dashboardService.getDashboardStats(userId);
  }

  @Get('activity/:userId')
  @ApiOperation({ summary: 'Get recent activity for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of activities to return',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent activity retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getRecentActivity(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ): Promise<CustomApiResponse<RecentActivity[]>> {
    const activityLimit = limit ? parseInt(limit, 10) : 10;
    this.logger.log(
      `🔄 Recent activity requested for user: ${userId} (limit: ${activityLimit})`,
    );
    return this.dashboardService.getRecentActivity(userId, activityLimit);
  }

  @Get('progress/:userId')
  @ApiOperation({ summary: 'Get topic progress for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Topic progress retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTopicProgress(
    @Param('userId') userId: string,
  ): Promise<CustomApiResponse<TopicProgress[]>> {
    this.logger.log(`📈 Topic progress requested for user: ${userId}`);
    return this.dashboardService.getTopicProgress(userId);
  }

  @Get('all/:userId')
  @ApiOperation({
    summary: 'Get all dashboard data for a user (optimized single call)',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'All dashboard data retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAllDashboardData(@Param('userId') userId: string): Promise<
    CustomApiResponse<{
      stats: DashboardStats;
      recentActivity: RecentActivity[];
      topicProgress: TopicProgress[];
    }>
  > {
    this.logger.log(`🚀 All dashboard data requested for user: ${userId}`);
    const result = await this.dashboardService.getAllDashboardData(userId);
    this.logger.log(`✅ Dashboard data result for user ${userId}:`, {
      success: result.success,
      hasStats: !!result.data?.stats,
      activityCount: result.data?.recentActivity?.length || 0,
      progressCount: result.data?.topicProgress?.length || 0,
      error: result.error,
    });
    return result;
  }
}
