"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useBackendDashboardStats, useBackendRecentActivity, useBackendTopicProgress } from "@/hooks/useBackendDashboard";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, getActivityIcon, getActivityIconFromTitle } from "@/lib/utils/dashboard";
import { 
  Clock, 
  BarChart3, 
  BookOpen, 
  Target, 
  Plus, 
  Star,
  Sparkles,
  Trophy,
  Flame,
  Activity,
  Rocket,
  TrendingUp,
  Settings,
} from "lucide-react";
import type { RecentActivity, TopicProgress } from "@/types";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { QuickActionCard } from "@/components/features/dashboard/QuickActionCard";
import { RecentActivityItem } from "@/components/features/dashboard/RecentActivityItem";
import { TopicProgressCard } from "@/components/features/dashboard/TopicProgressCard";
import { PageLoading } from "@/components/ui/loading";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { StudyTimer } from "@/components/ui/study-timer";
import { useTheme } from "@/contexts/ThemeContext";

// Default stats object
const DEFAULT_STATS = {
  totalQuizzes: 0,
  totalExams: 0,
  totalFlashcards: 0,
  averageScore: 0,
  studyStreak: 0,
  questionsAnswered: 0,
};

export default function DashboardPage() {
  const router = useRouter();
  const { user: currentUser, loading: userLoading, setSignOutMessage } = useBackendAuth();
  const { isDark } = useTheme();
  const [isStudyTimerOpen, setIsStudyTimerOpen] = useState(false);

  // Use individual backend-powered dashboard hooks (JWT-secured)
  const statsQuery = useBackendDashboardStats();
  const activityQuery = useBackendRecentActivity(5);
  const progressQuery = useBackendTopicProgress();

  // Scroll to top when navigating
  useScrollToTop();

  // Extract data from individual queries
  const { stats, recentActivity, topicProgress } = useMemo(
    () => ({
      stats: statsQuery.data || null,
      recentActivity: activityQuery.data || [],
      topicProgress: progressQuery.data || [],
    }),
    [statsQuery.data, activityQuery.data, progressQuery.data]
  );

  // Loading states
  const showLoadingScreen = useMemo(() => {
    const authLoading = userLoading || !currentUser;
    const anyQueryLoading = (
      (statsQuery.isLoading && !statsQuery.data) ||
      (activityQuery.isLoading && !activityQuery.data) ||
      (progressQuery.isLoading && !progressQuery.data)
    );
    return authLoading || anyQueryLoading;
  }, [
    userLoading,
    currentUser,
    statsQuery.isLoading,
    statsQuery.data,
    activityQuery.isLoading,
    activityQuery.data,
    progressQuery.isLoading,
    progressQuery.data,
  ]);

  // Check for any query errors
  const hasErrors = statsQuery.error || activityQuery.error || progressQuery.error;
  
  // Log errors for debugging
  if (statsQuery.error) console.log('❌ Stats query error:', statsQuery.error);
  if (activityQuery.error) console.log('❌ Activity query error:', activityQuery.error);
  if (progressQuery.error) console.log('❌ Progress query error:', progressQuery.error);

  // Safe data with better null checking
  const safeStats = useMemo(() => stats || DEFAULT_STATS, [stats]);
  const safeRecentActivity = useMemo(() => {
    if (!recentActivity || !Array.isArray(recentActivity)) {
      console.log('🔍 Recent activity is null or not array:', recentActivity);
      return [];
    }
    const filtered = recentActivity.filter(activity => activity && typeof activity === 'object');
    console.log('🔍 Filtered recent activity:', filtered);
    return filtered;
  }, [recentActivity]);
  const safeTopicProgress = useMemo(() => {
    if (!topicProgress || !Array.isArray(topicProgress)) {
      console.log('🔍 Topic progress is null or not array:', topicProgress);
      return [];
    }
    const filtered = topicProgress.filter(topic => topic && typeof topic === 'object');
    console.log('🔍 Filtered topic progress:', filtered);
    return filtered;
  }, [topicProgress]);

  // EARLY REDIRECT: Check authentication immediately before showing any content
  useEffect(() => {
    if (!userLoading && !currentUser) {
      setSignOutMessage();
      router.push("/auth/signin");
    }
  }, [userLoading, currentUser, router, setSignOutMessage]);

  // Don't render anything while redirecting
  if (!userLoading && !currentUser) {
    return null;
  }

  // Professional loading screen
  if (showLoadingScreen) {
    return (
      <DashboardLayout>
        <PageLoading
          title="Loading Dashboard"
          subtitle="Preparing your learning insights..."
          variant="dashboard"
        />
      </DashboardLayout>
    );
  }

  // Show error state if any queries failed
  if (hasErrors) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-red-400 font-medium">Failed to load dashboard data</p>
            <p className="text-gray-500 text-sm mt-2">Please try refreshing the page</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Professional Header */}
        <motion.div 
          className="mb-4 sm:mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <DashboardHeader
            title="Dashboard"
            subtitle="Welcome back! Here's your learning progress overview"
            isDark={isDark}
          >
            {safeStats.studyStreak > 0 && (
              <motion.div 
                className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs ${
                  isDark 
                    ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20' 
                    : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Flame className={`h-3 w-3 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                <span className={`font-medium ${isDark ? 'text-amber-100' : 'text-amber-800'}`}>
                  {safeStats.studyStreak} day streak
                </span>
              </motion.div>
            )}
            <motion.div 
              className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs ${
                isDark 
                  ? 'bg-slate-800/60 border border-slate-700/50' 
                  : 'bg-slate-100/80 border border-slate-300/60'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trophy className={`h-3 w-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                Level {Math.floor(safeStats.questionsAnswered / 100) + 1}
              </span>
            </motion.div>
          </DashboardHeader>
        </motion.div>

        {/* Professional Stats Grid */}
        <div className="mb-6 sm:mb-8">
          <motion.div 
            className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="md:hover:scale-105 md:hover:-translate-y-1 transition-transform duration-200"
            >
              <StatCard
                value={safeStats.totalQuizzes}
                label="Total Quizzes"
                cardClass="bg-indigo-700 hover:bg-indigo-800 border-indigo-600 hover:border-indigo-500"
                textClass="text-white"
                sublabelClass="text-indigo-200"
                rightIcon={<BarChart3 className="h-6 w-6 text-indigo-200" />}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="md:hover:scale-105 md:hover:-translate-y-1 transition-transform duration-200"
            >
              <StatCard
                value={`${safeStats.averageScore.toFixed(1)}%`}
                label="Average Score"
                cardClass="bg-gradient-to-br from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 border-emerald-500 hover:border-emerald-400"
                textClass="text-white"
                sublabelClass="text-emerald-200"
                rightIcon={<Star className="h-6 w-6 text-emerald-200" />}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="md:hover:scale-105 md:hover:-translate-y-1 transition-transform duration-200"
            >
              <StatCard
                value={safeStats.studyStreak}
                label="Day Streak"
                cardClass="bg-orange-700 hover:bg-orange-800 border-orange-600 hover:border-orange-500"
                textClass="text-white"
                sublabelClass="text-orange-200"
                rightIcon={<Flame className="h-6 w-6 text-orange-200" />}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="md:hover:scale-105 md:hover:-translate-y-1 transition-transform duration-200"
            >
              <StatCard
                value={safeStats.totalFlashcards}
                label="Flashcards"
                cardClass="bg-violet-700 hover:bg-violet-800 border-violet-600 hover:border-violet-500"
                textClass="text-white"
                sublabelClass="text-violet-200"
                rightIcon={<BookOpen className="h-6 w-6 text-violet-200" />}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Professional Quick Actions */}
        <motion.div 
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Rocket className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <h2 className={`text-base sm:text-lg font-bold ${
              isDark ? 'text-gray-100' : 'text-gray-900'
            }`}>Quick Actions</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent"></div>
          </div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, staggerChildren: 0.1 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="md:hover:scale-105 md:hover:-translate-y-1 transition-transform duration-200"
            >
              <QuickActionCard
                icon={<Plus className="h-5 w-5 text-blue-300" />}
                title="Create Quiz"
                description="Design custom assessments"
                href="/quiz/create"
                cardClass="hover:border-blue-500/40"
                iconClass="bg-blue-500/20 border border-blue-500/40 group-hover:bg-blue-500/30"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="md:hover:scale-105 md:hover:-translate-y-1 transition-transform duration-200"
            >
              <QuickActionCard
                icon={<Sparkles className="h-5 w-5 text-purple-300" />}
                title="AI Flashcards"
                description="Generate with AI assistance"
                href="/flashcards/create"
                cardClass="hover:border-purple-500/40"
                iconClass="bg-purple-500/20 border border-purple-500/40 group-hover:bg-purple-500/30"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="md:hover:scale-105 md:hover:-translate-y-1 transition-transform duration-200"
            >
              <QuickActionCard
                icon={<Clock className="h-5 w-5 text-orange-300" />}
                title="Study Timer"
                description="Focus with Pomodoro technique"
                onClick={() => setIsStudyTimerOpen(true)}
                cardClass="hover:border-orange-500/40"
                iconClass="bg-orange-500/20 border border-orange-500/40 group-hover:bg-orange-500/30"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="md:hover:scale-105 md:hover:-translate-y-1 transition-transform duration-200"
            >
              <QuickActionCard
                icon={<BarChart3 className="h-5 w-5 text-emerald-300" />}
                title="View Progress"
                description="Track your achievements"
                href="/analytics"
                cardClass="hover:border-emerald-500/40"
                iconClass="bg-emerald-500/20 border border-emerald-500/40 group-hover:bg-emerald-500/30"
              />
            </motion.div>

          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <h2 className={`text-base sm:text-lg font-bold ${
              isDark ? 'text-gray-100' : 'text-gray-900'
            }`}>Track Your Learning</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/30 to-transparent"></div>
          </div>
        </motion.div>

        {/* Professional Content Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, staggerChildren: 0.2 }}
        >
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            className="md:hover:scale-[1.01] transition-transform duration-200"
          >
            <Card className={`${
              isDark 
                ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/60' 
                : 'bg-white/80 border-gray-200/60 hover:bg-white/90'
            } transition-all duration-300`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`flex items-center gap-2 text-sm sm:text-base font-semibold ${
                    isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    <div className={`h-5 w-5 sm:h-6 sm:w-6 rounded-lg flex items-center justify-center ${
                      isDark 
                        ? 'bg-slate-600/20 border border-slate-500/30' 
                        : 'bg-gray-100/80 border border-gray-300/60'
                    }`}>
                      <Clock className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                        isDark ? 'text-slate-300' : 'text-gray-600'
                      }`} />
                    </div>
                    <span>Recent Activity</span>
                  </CardTitle>
                  <div className={`px-2 py-1 rounded-md ${
                    isDark 
                      ? 'bg-slate-700/50 border border-slate-600/50' 
                      : 'bg-gray-100/80 border border-gray-300/60'
                  }`}>
                    <span className={`text-xs font-medium ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}>{safeRecentActivity.length} items</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {safeRecentActivity.length > 0 ? (
                  <div className="space-y-2 max-h-60 sm:max-h-80 overflow-y-auto custom-scrollbar-dark pr-1 sm:pr-2">
                    {safeRecentActivity.filter((activity: RecentActivity) => activity && activity.id).map((activity: RecentActivity, index: number) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3 + index * 0.1 }}
                        className="md:hover:scale-[1.01] transition-transform duration-200"
                      >
                        <RecentActivityItem
                          icon={React.createElement(getActivityIconFromTitle(activity?.title || ''), { className: "h-4 w-4 text-blue-400" })}
                          title={activity?.title || 'Unknown Activity'}
                          date={formatDate(activity?.completed_at || new Date().toISOString())}
                          score={activity?.score}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 ${
                      isDark 
                        ? 'bg-slate-700/40 border border-slate-600/40' 
                        : 'bg-gray-100/80 border border-gray-300/60'
                    }`}>
                      <BookOpen className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                    </div>
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>No recent activity</p>
                    <p className={`text-xs mt-0.5 ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>Create and complete quizzes to see your activity here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Topic Progress */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4 }}
            className="md:hover:scale-[1.01] transition-transform duration-200"
          >
            <Card className={`${
              isDark 
                ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/60' 
                : 'bg-white/80 border-gray-200/60 hover:bg-white/90'
            } transition-all duration-300`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`flex items-center gap-2 text-sm sm:text-base font-semibold ${
                    isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    <div className={`h-5 w-5 sm:h-6 sm:w-6 rounded-lg flex items-center justify-center ${
                      isDark 
                        ? 'bg-slate-600/20 border border-slate-500/30' 
                        : 'bg-gray-100/80 border border-gray-300/60'
                    }`}>
                      <BarChart3 className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                        isDark ? 'text-slate-300' : 'text-gray-600'
                      }`} />
                    </div>
                    <span>Topic Progress</span>
                  </CardTitle>
                  <div className={`px-2 py-1 rounded-md ${
                    isDark 
                      ? 'bg-slate-700/50 border border-slate-600/50' 
                      : 'bg-gray-100/80 border border-gray-300/60'
                  }`}>
                    <span className={`text-xs font-medium ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}>{safeTopicProgress.length} topics</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {safeTopicProgress.length > 0 ? (
                  <div className="space-y-3 max-h-60 sm:max-h-80 overflow-y-auto custom-scrollbar-dark pr-1 sm:pr-2">
                    {safeTopicProgress.filter((topic: TopicProgress) => topic && topic.topic_id).map((topic: TopicProgress, index: number) => (
                      <motion.div
                        key={topic.topic_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5 + index * 0.1 }}
                        className="md:hover:scale-[1.01] transition-transform duration-200"
                      >
                        <TopicProgressCard topic={topic} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 ${
                      isDark 
                        ? 'bg-slate-700/40 border border-slate-600/40' 
                        : 'bg-gray-100/80 border border-gray-300/60'
                    }`}>
                      <Target className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`} />
                    </div>
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>No progress data</p>
                    <p className={`text-xs mt-0.5 ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>Start learning to track your progress</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Study Timer Modal */}
      <StudyTimer 
        isOpen={isStudyTimerOpen} 
        onClose={() => setIsStudyTimerOpen(false)} 
      />


    </DashboardLayout>
  );
}
