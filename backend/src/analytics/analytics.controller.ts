import { Controller, Get, Query, Logger } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { ApiResponse as CustomApiResponse } from '../types/shared.types';
import { User } from '../auth/decorators/user.decorator';
import { AuthUser } from '../auth/strategies/jwt.strategy';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private analyticsService: AnalyticsService) {}

  @Get('progress-over-time')
  @ApiOperation({ summary: 'Get user progress over time for charts' })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Start date (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'End date (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Progress over time data retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserProgressOverTime(
    @User() user: AuthUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<CustomApiResponse<any>> {
    this.logger.log(`📈 Progress over time requested for user: ${user.id}`);

    let dateRange;
    if (from && to) {
      dateRange = {
        from: new Date(from),
        to: new Date(to),
      };
    }

    return this.analyticsService.getUserProgressOverTime(user.id, dateRange);
  }

  @Get('activity-heatmap')
  @ApiOperation({ summary: 'Get user activity heatmap data' })
  @ApiQuery({
    name: 'year',
    required: false,
    description: 'Year for heatmap data',
    example: '2024',
  })
  @ApiResponse({
    status: 200,
    description: 'Activity heatmap data retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserActivityHeatmap(
    @User() user: AuthUser,
    @Query('year') year?: string,
  ): Promise<CustomApiResponse<any>> {
    this.logger.log(`🔥 Activity heatmap requested for user: ${user.id}`);

    const yearNumber = year ? parseInt(year, 10) : undefined;
    return this.analyticsService.getUserActivityHeatmap(user.id, yearNumber);
  }

  @Get('accuracy-breakdown')
  @ApiOperation({ summary: 'Get user accuracy breakdown by type and difficulty' })
  @ApiResponse({
    status: 200,
    description: 'Accuracy breakdown data retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserAccuracyBreakdown(
    @User() user: AuthUser,
  ): Promise<CustomApiResponse<any>> {
    this.logger.log(`📊 Accuracy breakdown requested for user: ${user.id}`);
    return this.analyticsService.getUserAccuracyBreakdown(user.id);
  }

  @Get('quiz-performance-trend')
  @ApiOperation({ summary: 'Get user quiz performance trend over time' })
  @ApiResponse({
    status: 200,
    description: 'Quiz performance trend data retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserQuizPerformanceTrend(
    @User() user: AuthUser,
  ): Promise<CustomApiResponse<any>> {
    this.logger.log(`📈 Quiz performance trend requested for user: ${user.id}`);
    return this.analyticsService.getUserQuizPerformanceTrend(user.id);
  }

  @Get('flashcard-analytics')
  @ApiOperation({ summary: 'Get user flashcard mastery and review analytics' })
  @ApiResponse({
    status: 200,
    description: 'Flashcard analytics data retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserFlashcardAnalytics(
    @User() user: AuthUser,
  ): Promise<CustomApiResponse<any>> {
    this.logger.log(`📚 Flashcard analytics requested for user: ${user.id}`);
    return this.analyticsService.getUserFlashcardAnalytics(user.id);
  }

  @Get('best-worst-topics')
  @ApiOperation({ summary: 'Get user best and worst performing topics' })
  @ApiResponse({
    status: 200,
    description: 'Best/worst topics data retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserBestWorstTopics(
    @User() user: AuthUser,
  ): Promise<CustomApiResponse<any>> {
    this.logger.log(`🏆 Best/worst topics requested for user: ${user.id}`);
    return this.analyticsService.getUserBestWorstTopics(user.id);
  }

  @Get('comprehensive')
  @ApiOperation({
    summary: 'Get comprehensive analytics data for the analytics page (all data in one call)',
  })
  @ApiResponse({
    status: 200,
    description: 'Comprehensive analytics data retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getComprehensiveAnalytics(
    @User() user: AuthUser,
  ): Promise<CustomApiResponse<any>> {
    this.logger.log(`🚀 Comprehensive analytics requested for user: ${user.id}`);
    const result = await this.analyticsService.getComprehensiveAnalytics(user.id);
    
    this.logger.log(`✅ Comprehensive analytics result for user ${user.id}:`, {
      success: result.success,
      hasProgressData: !!result.data?.progressOverTime?.length,
      hasHeatmapData: !!result.data?.activityHeatmap?.length,
      hasAccuracyData: !!result.data?.accuracyBreakdown,
      hasQuizData: !!result.data?.quizPerformanceTrend?.length,
      hasFlashcardData: !!result.data?.flashcardAnalytics,
      hasTopicsData: !!result.data?.bestWorstTopics,
      error: result.error,
    });
    
    return result;
  }
} 