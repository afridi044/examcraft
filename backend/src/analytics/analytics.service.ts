import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ApiResponse } from '../types/shared.types';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private databaseService: DatabaseService) {}

  /**
   * Get user progress over time for line/area charts
   */
  async getUserProgressOverTime(
    userId: string,
    dateRange?: { from: Date; to: Date }
  ): Promise<ApiResponse<any>> {
    this.logger.log(`📈 Getting progress over time for user: ${userId}`);
    return this.databaseService.getUserProgressOverTime(userId, dateRange);
  }

  /**
   * Get user activity heatmap data for calendar visualization
   */
  async getUserActivityHeatmap(
    userId: string,
    year?: number
  ): Promise<ApiResponse<any>> {
    this.logger.log(`🔥 Getting activity heatmap for user: ${userId}`);
    return this.databaseService.getUserActivityHeatmap(userId, year);
  }

  /**
   * Get accuracy breakdown by question type and difficulty
   */
  async getUserAccuracyBreakdown(userId: string): Promise<ApiResponse<any>> {
    this.logger.log(`📊 Getting accuracy breakdown for user: ${userId}`);
    return this.databaseService.getUserAccuracyBreakdown(userId);
  }

  /**
   * Get quiz performance trend over time
   */
  async getUserQuizPerformanceTrend(userId: string): Promise<ApiResponse<any>> {
    this.logger.log(`📈 Getting quiz performance trend for user: ${userId}`);
    return this.databaseService.getUserQuizPerformanceTrend(userId);
  }

  /**
   * Get flashcard mastery distribution and review history
   */
  async getUserFlashcardAnalytics(userId: string): Promise<ApiResponse<any>> {
    this.logger.log(`📚 Getting flashcard analytics for user: ${userId}`);
    return this.databaseService.getUserFlashcardAnalytics(userId);
  }

  /**
   * Get best and worst performing topics
   */
  async getUserBestWorstTopics(userId: string): Promise<ApiResponse<any>> {
    this.logger.log(`🏆 Getting best/worst topics for user: ${userId}`);
    return this.databaseService.getUserBestWorstTopics(userId);
  }

  /**
   * Get comprehensive analytics data for the analytics page
   * This combines multiple analytics endpoints for efficient frontend loading
   */
  async getComprehensiveAnalytics(userId: string): Promise<ApiResponse<{
    progressOverTime: any[];
    activityHeatmap: any[];
    accuracyBreakdown: any;
    quizPerformanceTrend: any[];
    flashcardAnalytics: any;
    bestWorstTopics: any;
  }>> {
    try {
      this.logger.log(`🚀 Getting comprehensive analytics for user: ${userId}`);

      // Fetch all analytics data in parallel for efficiency
      const [
        progressResult,
        heatmapResult,
        accuracyResult,
        quizTrendResult,
        flashcardResult,
        topicsResult,
      ] = await Promise.all([
        this.getUserProgressOverTime(userId),
        this.getUserActivityHeatmap(userId),
        this.getUserAccuracyBreakdown(userId),
        this.getUserQuizPerformanceTrend(userId),
        this.getUserFlashcardAnalytics(userId),
        this.getUserBestWorstTopics(userId),
      ]);

      // Check if any request failed
      if (
        !progressResult.success ||
        !heatmapResult.success ||
        !accuracyResult.success ||
        !quizTrendResult.success ||
        !flashcardResult.success ||
        !topicsResult.success
      ) {
        const error = 
          progressResult.error || 
          heatmapResult.error || 
          accuracyResult.error || 
          quizTrendResult.error || 
          flashcardResult.error || 
          topicsResult.error;
        
        return {
          success: false,
          data: null,
          error: error || 'Failed to fetch analytics data',
        };
      }

      const comprehensiveData = {
        progressOverTime: progressResult.data || [],
        activityHeatmap: heatmapResult.data || [],
        accuracyBreakdown: accuracyResult.data || {},
        quizPerformanceTrend: quizTrendResult.data || [],
        flashcardAnalytics: flashcardResult.data || {},
        bestWorstTopics: topicsResult.data || {},
      };

      this.logger.log(`✅ Successfully retrieved comprehensive analytics data`);
      return {
        success: true,
        data: comprehensiveData,
        error: null,
      };
    } catch (error) {
      this.logger.error(`❌ Error fetching comprehensive analytics:`, error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
} 