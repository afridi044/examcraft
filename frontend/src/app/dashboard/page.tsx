"use client";

import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useBackendDashboardStats, useBackendRecentActivity, useBackendTopicProgress } from "@/hooks/useBackendDashboard";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { EmptyState } from "@/components/features/dashboard/EmptyState";
import { ActivityCard } from "@/components/features/dashboard/ActivityCard";
import { TopicProgressCard } from "@/components/features/dashboard/TopicProgressCard";
import { ExpandableSection } from "@/components/features/dashboard/ExpandableSection";
import { formatDate, getActivityIcon, STAT_CARDS_CONFIG } from "@/lib/utils/dashboard";
import { Loader2, Clock, BarChart3, BookOpen, Target } from "lucide-react";
import type { RecentActivity, TopicProgress } from "@/types";

// Default stats object - moved outside to prevent re-creation
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

  // State for view all functionality
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showAllProgress, setShowAllProgress] = useState(false);

  // Get current user profile data for proper database user ID
  const { user: currentUser, loading: userLoading } = useBackendAuth();

  // Memoize userId to prevent unnecessary re-renders
  const userId = useMemo(
    () => currentUser?.id || "",
    [currentUser?.id]
  );

  // Use individual backend-powered dashboard hooks
  const statsQuery = useBackendDashboardStats(userId);
  const activityQuery = useBackendRecentActivity(userId, 10);
  const progressQuery = useBackendTopicProgress(userId);

  // Extract data from individual queries
  const { stats, recentActivity, topicProgress } = useMemo(
    () => ({
      stats: statsQuery.data || null,
      recentActivity: activityQuery.data || [],
      topicProgress: progressQuery.data || [],
    }),
    [statsQuery.data, activityQuery.data, progressQuery.data]
  );

  // Memoize loading states to prevent unnecessary recalculations
  const showLoadingScreen = useMemo(() => {
    // Show loading if auth is still loading or if we have a user but no userId yet
    const authLoading = userLoading || (currentUser && !userId);
    // Show loading if any of the individual queries are loading and don't have data yet
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

  // Memoize safe data to prevent object re-creation
  const safeStats = useMemo(() => stats || DEFAULT_STATS, [stats]);
  const safeRecentActivity = useMemo(() => recentActivity, [recentActivity]);
  const safeTopicProgress = useMemo(() => topicProgress, [topicProgress]);

  // Redirect logic
  useEffect(() => {
    if (!userLoading && !currentUser) {
      router.push("/auth/signin");
    }
  }, [userLoading, currentUser, router]);

  // Single loading screen for all loading states
  if (showLoadingScreen) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/50">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-2xl blur-xl"></div>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              Loading Dashboard...
            </h2>
            <p className="text-gray-400">Preparing your learning experience</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-6">
        <div className="space-y-6 sm:space-y-8">
        {/* Welcome Header */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Here&apos;s your learning progress overview
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {STAT_CARDS_CONFIG.map((config) => (
            <StatCard
              key={config.key}
              title={config.title}
              value={safeStats[config.key as keyof typeof safeStats] as number}
              suffix={config.suffix}
              icon={config.icon}
              iconBgColor={config.iconBgColor}
              iconShadowColor={config.iconShadowColor}
              borderHoverColor={config.borderHoverColor}
              shadowHoverColor={config.shadowHoverColor}
              trendText={config.trendText}
              href={config.href}
              ariaLabel={config.ariaLabel}
            />
          ))}
        </div>

        {/* Recent Activity */}
        <ExpandableSection
          title="Recent Activity"
          icon={Clock}
          iconBgColor="bg-gradient-to-br from-blue-500 to-blue-600"
          iconShadowColor="shadow-blue-500/20"
          gradientFrom="from-blue-500/10"
          gradientTo="to-purple-500/10"
          showExpandButton={safeRecentActivity.length > 3}
          isExpanded={showAllActivity}
          onToggle={() => setShowAllActivity(!showAllActivity)}
        >
          {safeRecentActivity.length > 0 ? (
            <div className="space-y-2">
              {(showAllActivity
                ? safeRecentActivity
                : safeRecentActivity.slice(0, 3)
              ).map((activity: RecentActivity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  icon={getActivityIcon(activity.type)}
                  formatDate={formatDate}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No recent activity"
              description="Start taking quizzes to see your activity here"
            />
          )}
        </ExpandableSection>

        {/* Topic Progress */}
        <ExpandableSection
          title="Topic Progress"
          icon={BarChart3}
          iconBgColor="bg-gradient-to-br from-purple-500 to-purple-600"
          iconShadowColor="shadow-purple-500/20"
          gradientFrom="from-purple-500/10"
          gradientTo="to-pink-500/10"
          showExpandButton={safeTopicProgress.length > 3}
          isExpanded={showAllProgress}
          onToggle={() => setShowAllProgress(!showAllProgress)}
        >
          {safeTopicProgress.length > 0 ? (
            <div className="space-y-2">
              {(showAllProgress
                ? safeTopicProgress
                : safeTopicProgress.slice(0, 3)
              ).map((topic: TopicProgress) => (
                <TopicProgressCard key={topic.topic_id} topic={topic} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Target}
              title="No progress data"
              description="Answer questions to track your progress by topic"
            />
          )}
        </ExpandableSection>
        </div>
      </div>
    </DashboardLayout>
  );
}
