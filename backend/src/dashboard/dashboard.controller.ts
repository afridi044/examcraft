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
import { User } from '../auth/decorators/user.decorator';
import { AuthUser } from '../auth/strategies/jwt.strategy';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getDashboardStats(
    @User() user: AuthUser,
  ): Promise<CustomApiResponse<DashboardStats>> {
    this.logger.log(`📊 Dashboard stats requested for user: ${user.id}`);
    return this.dashboardService.getDashboardStats(user.id);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get recent activity for authenticated user' })
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
    @User() user: AuthUser,
    @Query('limit') limit?: string,
  ): Promise<CustomApiResponse<RecentActivity[]>> {
    const activityLimit = limit ? parseInt(limit, 10) : 10;
    this.logger.log(
      `🔄 Recent activity requested for user: ${user.id} (limit: ${activityLimit})`,
    );
    return this.dashboardService.getRecentActivity(user.id, activityLimit);
  }

  @Get('progress')
  @ApiOperation({ summary: 'Get topic progress for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Topic progress retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTopicProgress(
    @User() user: AuthUser,
  ): Promise<CustomApiResponse<TopicProgress[]>> {
    this.logger.log(`📈 Topic progress requested for user: ${user.id}`);
    return this.dashboardService.getTopicProgress(user.id);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all dashboard data for authenticated user (optimized single call)',
  })
  @ApiResponse({
    status: 200,
    description: 'All dashboard data retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAllDashboardData(@User() user: AuthUser): Promise<
    CustomApiResponse<{
      stats: DashboardStats;
      recentActivity: RecentActivity[];
      topicProgress: TopicProgress[];
    }>
  > {
    this.logger.log(`🚀 All dashboard data requested for user: ${user.id}`);
    const result = await this.dashboardService.getAllDashboardData(user.id);
    this.logger.log(`✅ Dashboard data result for user ${user.id}:`, {
      success: result.success,
      hasStats: !!result.data?.stats,
      activityCount: result.data?.recentActivity?.length || 0,
      progressCount: result.data?.topicProgress?.length || 0,
      error: result.error,
    });
    return result;
  }
}
