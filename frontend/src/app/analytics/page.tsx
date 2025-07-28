'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Target, 
  Calendar, 
  BookOpen, 
  Trophy,
  AlertCircle,
  RefreshCw,
  Clock,
  Activity
} from 'lucide-react';
import { useComprehensiveAnalytics, useTopicStats } from '@/hooks/useBackendAnalytics';
import { QuestionsAccuracyChart } from '@/components/features/analytics/QuestionsAccuracyChart';
import { AverageTimeChart } from '@/components/features/analytics/AverageTimeChart';
import { ActivityHeatmap } from '@/components/features/analytics/ActivityHeatmap';
import { AccuracyBreakdownChart } from '@/components/features/analytics/AccuracyBreakdownChart';
import { QuizPerformanceChart } from '@/components/features/analytics/QuizPerformanceChart';
import { FlashcardAnalyticsChart } from '@/components/features/analytics/FlashcardAnalyticsChart';
import { BestWorstTopicsChart } from '@/components/features/analytics/BestWorstTopicsChart';
import { TopicStats } from '@/components/features/analytics/TopicStats';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { PageLoading } from '@/components/ui/loading';

export default function AnalyticsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { 
    data: analyticsData, 
    isLoading, 
    error, 
    refetch 
  } = useComprehensiveAnalytics();

  const { 
    data: topicStatsData, 
    isLoading: topicStatsLoading, 
    error: topicStatsError 
  } = useTopicStats();

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  // Calculate summary stats
  const totalActivities = analyticsData?.activityHeatmap?.reduce((sum, item) => sum + item.activity_count, 0) || 0;
  const activeDays = analyticsData?.activityHeatmap?.filter(item => item.activity_count > 0).length || 0;
  
  // Calculate total questions from accuracy breakdown data (only question answers)
  const totalQuestions = analyticsData?.accuracyBreakdown?.byType?.reduce((sum, item) => sum + item.total_attempts, 0) || 0;
  
  const averageAccuracy = analyticsData?.accuracyBreakdown?.byType?.length > 0 
    ? Math.round(analyticsData.accuracyBreakdown.byType.reduce((sum, item) => sum + item.accuracy_percentage, 0) / analyticsData.accuracyBreakdown.byType.length)
    : 0;
  const totalFlashcards = analyticsData?.flashcardAnalytics?.totalFlashcards || 0;
  
    // Get total study time from backend calculation
  const totalTimeSeconds = analyticsData?.totalStudyTimeSeconds || 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageLoading
          title="Loading Analytics"
          subtitle="Gathering your learning insights..."
          variant="dashboard"
        />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-100 mb-2">Error Loading Analytics</h2>
            <p className="text-gray-400 mb-4">
              {error instanceof Error ? error.message : 'Failed to load analytics data'}
            </p>
            <Button 
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analyticsData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-100 mb-2">No Analytics Data</h2>
            <p className="text-gray-400">Start learning to see your analytics!</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Professional Header */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <DashboardHeader
            title="Learning Analytics"
            subtitle="Track your progress, identify patterns, and optimize your learning journey"
          />
        </motion.div>

        {/* Main Analytics Grid - Fixed Layout */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Row 1: Key Metrics Summary - Moved to the very top */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
          >
            <Card className="bg-slate-900/80 border-slate-800/80 p-3 sm:p-4 hover:bg-slate-900/40 transition-colors">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg mr-2 sm:mr-3">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400">Total Questions</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{totalQuestions}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800/80 p-3 sm:p-4 hover:bg-slate-900/40 transition-colors">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg mr-2 sm:mr-3">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400">Overall Score</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{averageAccuracy}%</p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800/80 p-3 sm:p-4 hover:bg-slate-900/40 transition-colors">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-yellow-500/20 rounded-lg mr-2 sm:mr-3">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400">Total Time</p>
                  <p className="text-lg sm:text-xl font-bold text-white">
                    {totalTimeSeconds < 60 
                      ? `${Math.floor(totalTimeSeconds)}s`
                      : totalTimeSeconds < 3600 
                      ? `${Math.floor(totalTimeSeconds / 60)}m ${Math.floor(totalTimeSeconds % 60)}s`
                      : `${Math.floor(totalTimeSeconds / 3600)}h ${Math.floor((totalTimeSeconds % 3600) / 60)}m`
                    }
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800/80 p-3 sm:p-4 hover:bg-slate-900/40 transition-colors">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-green-500/20 rounded-lg mr-2 sm:mr-3">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400">Study Days</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{activeDays}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Row 2: Progress Over Time Charts - 2 Column Grid (except mobile) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Questions & Accuracy Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-slate-900/80 border-slate-800/80 p-4 sm:p-6 hover:bg-slate-900/40 transition-colors relative overflow-hidden">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="p-2 bg-green-500/20 rounded-lg mr-3 sm:mr-4">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-100">Questions & Accuracy</h3>
                    <p className="text-sm text-gray-400">Daily learning activity and performance trends</p>
                  </div>
                </div>
                <div className="h-64 sm:h-72 md:h-80 relative z-10 -ml-10">
                  <QuestionsAccuracyChart data={analyticsData.progressOverTime} />
                </div>
              </Card>
            </motion.div>

            {/* Average Time Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-slate-900/80 border-slate-800/80 p-4 sm:p-6 hover:bg-slate-900/40 transition-colors relative overflow-hidden">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="p-2 bg-orange-500/20 rounded-lg mr-3 sm:mr-4">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-100">Average Time per Question</h3>
                    <p className="text-sm text-gray-400">Time efficiency in answering questions</p>
                  </div>
                </div>
                <div className="h-64 sm:h-72 md:h-80 relative z-10 -ml-10">
                  <AverageTimeChart data={analyticsData.progressOverTime} />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Row 3: Activity Heatmap and Accuracy Breakdown - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="self-stretch"
            >
              <Card className="bg-slate-900/80 border-slate-800/80 p-4 sm:p-6 hover:bg-slate-900/40 transition-colors h-full relative overflow-hidden">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="p-2 bg-green-500/20 rounded-lg mr-3 sm:mr-4">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-100">Activity Heatmap</h3>
                    <p className="text-sm text-gray-400">Your daily learning consistency</p>
                  </div>
                </div>
                <div className="relative z-10 h-full">
                  <ActivityHeatmap data={analyticsData.activityHeatmap} />
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="self-stretch"
            >
              <Card className="bg-slate-900/80 border-slate-800/80 p-4 sm:p-6 hover:bg-slate-900/40 transition-colors h-full relative overflow-hidden">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="p-2 bg-purple-500/20 rounded-lg mr-3 sm:mr-4">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-100">Accuracy Breakdown</h3>
                    <p className="text-sm text-gray-400">Performance by question type and difficulty</p>
                  </div>
                </div>
                <div className="relative z-10 h-full">
                  <AccuracyBreakdownChart data={analyticsData.accuracyBreakdown} />
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Row 4: Quiz Performance and Flashcard Analytics - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="bg-slate-900/80 border-slate-800/80 p-4 sm:p-6 hover:bg-slate-900/40 transition-colors h-full">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="p-2 bg-orange-500/20 rounded-lg mr-3 sm:mr-4 ">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-100">Quiz Performance</h3>
                    <p className="text-sm text-gray-400">Your quiz scores over time</p>
                  </div>
                </div>
                <QuizPerformanceChart data={analyticsData.quizPerformanceTrend} />
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="bg-slate-900/80 border-slate-800/80 p-4 sm:p-6 hover:bg-slate-900/40 transition-colors h-full">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="p-2 bg-yellow-500/20 rounded-lg mr-3 sm:mr-4">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-100">Flashcard Mastery</h3>
                    <p className="text-sm text-gray-400">Your flashcard learning progress</p>
                  </div>
                </div>
                <FlashcardAnalyticsChart data={analyticsData.flashcardAnalytics} />
              </Card>
            </motion.div>
          </div>

          {/* Row 5: Topic Stats (Full Width) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="bg-slate-900/80 border-slate-700/60 p-4 sm:p-6 hover:bg-slate-900/40 transition-colors">
              <TopicStats data={topicStatsData || []} />
            </Card>
          </motion.div>

          {/* Row 6: Topic Performance (Full Width) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card className="bg-slate-900/80 border-slate-700/60 p-4 sm:p-6 hover:bg-slate-900/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-500/20 rounded-lg mr-3 sm:mr-4">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-100">Topic Performance</h3>
                    <p className="text-sm text-gray-400">Your best and worst performing topics</p>
                  </div>
                </div>
              </div>
              <BestWorstTopicsChart data={analyticsData.bestWorstTopics} />
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
} 