"use client";

import React, { useEffect, useMemo } from "react";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useBackendDashboardStats, useBackendRecentActivity, useBackendTopicProgress } from "@/hooks/useBackendDashboard";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, getActivityIcon } from "@/lib/utils/dashboard";
import { 
  Loader2, 
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
} from "lucide-react";
import type { RecentActivity, TopicProgress } from "@/types";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { QuickActionCard } from "@/components/features/dashboard/QuickActionCard";
import { RecentActivityItem } from "@/components/features/dashboard/RecentActivityItem";
import { TopicProgressCard } from "@/components/features/dashboard/TopicProgressCard";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { useScrollToTop } from "@/hooks/useScrollToTop";

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
  const { user: currentUser, loading: userLoading } = useBackendAuth();
  
  // Memoize userId to prevent unnecessary re-renders
  const userId = useMemo(() => currentUser?.id || "", [currentUser?.id]);

  // Use individual backend-powered dashboard hooks
  const statsQuery = useBackendDashboardStats(userId);
  const activityQuery = useBackendRecentActivity(userId, 5);
  const progressQuery = useBackendTopicProgress(userId);

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
    const authLoading = userLoading || (currentUser && !userId);
    const anyQueryLoading = userId && (
      (statsQuery.isLoading && !statsQuery.data) ||
      (activityQuery.isLoading && !activityQuery.data) ||
      (progressQuery.isLoading && !progressQuery.data)
    );
    return authLoading || anyQueryLoading;
  }, [
    userLoading,
    currentUser,
    userId,
    statsQuery.isLoading,
    statsQuery.data,
    activityQuery.isLoading,
    activityQuery.data,
    progressQuery.isLoading,
    progressQuery.data,
  ]);

  // Safe data
  const safeStats = useMemo(() => stats || DEFAULT_STATS, [stats]);
  const safeRecentActivity = useMemo(() => recentActivity, [recentActivity]);
  const safeTopicProgress = useMemo(() => topicProgress, [topicProgress]);

  // Redirect logic
  useEffect(() => {
    if (!userLoading && !currentUser) {
      router.push("/auth/signin");
    }
  }, [userLoading, currentUser, router]);

  // Professional loading screen
  if (showLoadingScreen) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="h-16 w-16 bg-slate-800/60 border border-slate-700/60 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-100 mb-2">
              Loading Dashboard
            </h2>
            <p className="text-gray-400">Preparing your learning insights...</p>
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
            emoji="🎉"
          >
            {safeStats.studyStreak > 0 && (
              <motion.div 
                className="flex items-center gap-2 px-2 py-1 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-full text-xs"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Flame className="h-3 w-3 text-amber-400" />
                <span className="font-medium text-amber-100">{safeStats.studyStreak} day streak</span>
              </motion.div>
            )}
            <motion.div 
              className="flex items-center gap-2 px-2 py-1 bg-slate-800/60 border border-slate-700/50 rounded-full text-xs"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trophy className="h-3 w-3 text-blue-400" />
              <span className="font-medium text-slate-200">Level {Math.floor(safeStats.questionsAnswered / 100) + 1}</span>
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
            <h2 className="text-base sm:text-lg font-bold text-gray-100">Quick Actions</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent"></div>
          </div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
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
                icon={<BarChart3 className="h-5 w-5 text-emerald-300" />}
                title="View Progress"
                description="Track your achievements"
                href="/dashboard/quiz-history"
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
            <h2 className="text-base sm:text-lg font-bold text-gray-100">Track Your Learning</h2>
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
            <Card className="bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/60 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-100 flex items-center gap-2 text-sm sm:text-base font-semibold">
                    <div className="h-5 w-5 sm:h-6 sm:w-6 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-400" />
                    </div>
                    <span>Recent Activity</span>
                  </CardTitle>
                  <div className="px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded-md">
                    <span className="text-xs font-medium text-slate-300">{safeRecentActivity.length} items</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {safeRecentActivity.length > 0 ? (
                  <div className="space-y-2 max-h-60 sm:max-h-80 overflow-y-auto custom-scrollbar-dark pr-1 sm:pr-2">
                    {safeRecentActivity.map((activity: RecentActivity, index: number) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3 + index * 0.1 }}
                        className="md:hover:scale-[1.01] transition-transform duration-200"
                      >
                        <RecentActivityItem
                          icon={React.createElement(getActivityIcon(activity.type), { className: "h-4 w-4 text-blue-400" })}
                          title={activity.title}
                          date={formatDate(activity.completed_at)}
                          score={activity.score}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-slate-700/40 border border-slate-600/40 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium">No recent activity</p>
                    <p className="text-gray-500 text-xs mt-0.5">Complete quizzes to see your activity here</p>
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
            <Card className="bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/60 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-100 flex items-center gap-2 text-sm sm:text-base font-semibold">
                    <div className="h-5 w-5 sm:h-6 sm:w-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-400" />
                    </div>
                    <span>Topic Progress</span>
                  </CardTitle>
                  <div className="px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded-md">
                    <span className="text-xs font-medium text-slate-300">{safeTopicProgress.length} topics</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {safeTopicProgress.length > 0 ? (
                  <div className="space-y-3 max-h-60 sm:max-h-80 overflow-y-auto custom-scrollbar-dark pr-1 sm:pr-2">
                    {safeTopicProgress.map((topic: TopicProgress, index: number) => (
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
                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-slate-700/40 border border-slate-600/40 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <Target className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium">No progress data</p>
                    <p className="text-gray-500 text-xs mt-0.5">Start learning to track your progress</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
