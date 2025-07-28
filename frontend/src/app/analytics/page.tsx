'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Calendar, 
  BookOpen, 
  Trophy,
  Loader2,
  AlertCircle,
  RefreshCw,
  Users,
  Clock,
  Award,
  Activity
} from 'lucide-react';
import { useComprehensiveAnalytics } from '@/hooks/useBackendAnalytics';
import { ProgressOverTimeChart } from '@/components/features/analytics/ProgressOverTimeChart';
import { ActivityHeatmap } from '@/components/features/analytics/ActivityHeatmap';
import { AccuracyBreakdownChart } from '@/components/features/analytics/AccuracyBreakdownChart';
import { QuizPerformanceChart } from '@/components/features/analytics/QuizPerformanceChart';
import { FlashcardAnalyticsChart } from '@/components/features/analytics/FlashcardAnalyticsChart';
import { BestWorstTopicsChart } from '@/components/features/analytics/BestWorstTopicsChart';
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

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  // Calculate summary stats
  const totalActivities = analyticsData?.activityHeatmap?.reduce((sum, item) => sum + item.activity_count, 0) || 0;
  const activeDays = analyticsData?.activityHeatmap?.filter(item => item.activity_count > 0).length || 0;
  const averageAccuracy = analyticsData?.accuracyBreakdown?.byType?.length > 0 
    ? Math.round(analyticsData.accuracyBreakdown.byType.reduce((sum, item) => sum + item.accuracy_percentage, 0) / analyticsData.accuracyBreakdown.byType.length)
    : 0;
  const totalFlashcards = analyticsData?.flashcardAnalytics?.totalFlashcards || 0;
  
  // Calculate average time from progress over time data
  const averageTimeMinutes = analyticsData?.progressOverTime?.length > 0 
    ? Math.round(analyticsData.progressOverTime.reduce((sum, item) => sum + (item.average_time_seconds || 0), 0) / analyticsData.progressOverTime.length / 60)
    : 0;

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
            emoji="📊"
          >
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </DashboardHeader>
        </motion.div>

        {/* Main Analytics Grid - Fixed Layout */}
        <div className="space-y-8">
          {/* Row 1: Key Metrics Summary - Moved to the very top */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Card className="bg-slate-800/40 border-slate-700/60 p-4 hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                  <Activity className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Questions</p>
                  <p className="text-xl font-bold text-white">{totalActivities}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-800/40 border-slate-700/60 p-4 hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
                  <Target className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Avg Accuracy</p>
                  <p className="text-xl font-bold text-white">{averageAccuracy}%</p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-800/40 border-slate-700/60 p-4 hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500/20 rounded-lg mr-3">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Avg Time</p>
                  <p className="text-xl font-bold text-white">{averageTimeMinutes} m</p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-800/40 border-slate-700/60 p-4 hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/20 rounded-lg mr-3">
                  <Calendar className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Study Days</p>
                  <p className="text-xl font-bold text-white">{activeDays}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Row 2: Progress Over Time (Full Width) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-slate-800/40 border-slate-700/60 p-6 hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg mr-4">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-100">Learning Progress Over Time</h3>
                  <p className="text-gray-400">Track your daily learning activity and accuracy trends</p>
                </div>
              </div>
              <div className="h-80">
                <ProgressOverTimeChart data={analyticsData.progressOverTime} />
              </div>
            </Card>
          </motion.div>

          {/* Row 3: Activity Heatmap and Accuracy Breakdown - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="self-stretch"
            >
              <Card className="bg-slate-800/40 border-slate-700/60 p-6 hover:bg-slate-800/60 transition-colors h-full">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-green-500/20 rounded-lg mr-4">
                    <Calendar className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-100">Activity Heatmap</h3>
                    <p className="text-gray-400">Your daily learning consistency</p>
                  </div>
                </div>
                <ActivityHeatmap data={analyticsData.activityHeatmap} />
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="self-stretch"
            >
              <Card className="bg-slate-800/40 border-slate-700/60 p-6 hover:bg-slate-800/60 transition-colors h-full">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-purple-500/20 rounded-lg mr-4">
                    <Target className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-100">Accuracy Breakdown</h3>
                    <p className="text-gray-400">Performance by question type and difficulty</p>
                  </div>
                </div>
                <AccuracyBreakdownChart data={analyticsData.accuracyBreakdown} />
              </Card>
            </motion.div>
          </div>

          {/* Row 4: Quiz Performance and Flashcard Analytics - Vertical Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="bg-slate-800/40 border-slate-700/60 p-6 hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-orange-500/20 rounded-lg mr-4">
                  <BarChart3 className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-100">Quiz Performance</h3>
                  <p className="text-gray-400">Your quiz scores over time</p>
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
            <Card className="bg-slate-800/40 border-slate-700/60 p-6 hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-yellow-500/20 rounded-lg mr-4">
                  <BookOpen className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-100">Flashcard Mastery</h3>
                  <p className="text-gray-400">Your flashcard learning progress</p>
                </div>
              </div>
              <FlashcardAnalyticsChart data={analyticsData.flashcardAnalytics} />
            </Card>
          </motion.div>

          {/* Row 5: Topic Performance (Full Width) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="bg-slate-800/40 border-slate-700/60 p-6 hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-amber-500/20 rounded-lg mr-4">
                  <Trophy className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-100">Topic Performance</h3>
                  <p className="text-gray-400">Your best and worst performing topics</p>
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