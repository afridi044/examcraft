import { Controller, Get, Post, Param, Query, Body, Logger } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
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

  constructor(private dashboardService: DashboardService) { }

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

  // =============================================
  // LAB EXAM TEMPLATE ENDPOINT - TOPICS
  // =============================================
  // This endpoint fetches all topics from the database

  @Get('lab-exam')
  @ApiOperation({ summary: 'Get all topics for lab exam' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of topics to return',
  })
  @ApiResponse({
    status: 200,
    description: 'Topics retrieved successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getLabExamData(
    @Query('limit') limit?: string,
  ): Promise<CustomApiResponse<any[]>> {
    const filters = {
      limit: limit ? parseInt(limit, 10) : undefined,
    };

    this.logger.log(`🧪 Topics data requested`, filters);
    return this.dashboardService.getLabExamData(filters);
  }

  // =============================================
  // LAB EXAM TEMPLATE ENDPOINT - CREATE TOPIC
  // =============================================
  // This endpoint creates a new topic in the database

  @Post('lab-exam')
  @ApiOperation({ summary: 'Create a new topic' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        is_active: { type: 'boolean' },
        price: { type: 'number' },
        category: { type: 'string' },
        created_at: { type: 'string' },
      },
      required: ['name'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Topic created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createLabExamData(
    @Body() topicData: { name: string; description?: string; is_active?: boolean; price?: number; category?: string; created_at?: string },
  ): Promise<CustomApiResponse<any>> {
    this.logger.log(`🧪 Creating new topic: ${topicData.name}`);
    return this.dashboardService.createLabExamData(topicData);
  }
}
