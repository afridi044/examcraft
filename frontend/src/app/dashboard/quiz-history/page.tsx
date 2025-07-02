"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Trophy,
  Clock,
  Calendar,
  Target,
  BookOpen,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Pause,
  CircleDot,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { QuizActionGroup } from "@/components/features/quiz-history/QuizActionGroup";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCurrentUser,
  useDeleteQuiz,
} from "@/hooks/useDatabase";
import { useBackendUserQuizAttempts, BACKEND_QUIZ_KEYS } from "@/hooks/useBackendQuiz";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { toast } from "react-hot-toast";
import {
  getScoreColors,
  formatDate,
  getStatusBadge,
  getStatusIconConfig,
  calculateQuizStats,
  filterAndSortAttempts,
} from "@/lib/utils/quiz-history";
import type { QuizAttempt } from "@/types";



export default function QuizHistoryPage() {
  const { user, loading } = useBackendAuth();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const deleteQuizMutation = useDeleteQuiz();
  const queryClient = useQueryClient();
  const router = useRouter();

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "score" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterBy, setFilterBy] = useState<
    "all" | "completed" | "incomplete" | "not_attempted" | "passed" | "failed"
  >("all");
  const [showFilters, setShowFilters] = useState(false);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);

  // Use the database user_id
  const userId = currentUser?.user_id || "";

  // FIXED: Redirect to landing page if not authenticated and not loading
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user]); // Removed router from dependencies to prevent unnecessary re-runs

  // Refresh quiz attempts when user returns to page to ensure real-time updates
  useEffect(() => {
    if (userId && user) {
      // Check if data is stale and invalidate if needed
      const queryState = queryClient.getQueryState(BACKEND_QUIZ_KEYS.userAttempts(userId));
      const isStale = !queryState || (Date.now() - (queryState.dataUpdatedAt || 0)) > 30000; // 30 seconds
      
      if (isStale) {
        queryClient.invalidateQueries({
          queryKey: BACKEND_QUIZ_KEYS.userAttempts(userId),
        });
      }
    }
  }, [userId, user, queryClient]);

  // OPTIMIZED: Use the new optimized backend hook instead of direct fetch
  const {
    data: quizAttempts,
    isLoading: loadingAttempts,
  } = useBackendUserQuizAttempts(userId);

  // Simplified loading state
  const showLoadingScreen = loading || userLoading || (userId && loadingAttempts && !quizAttempts);

  // Safe data
  const safeQuizAttempts = quizAttempts || [];

  // Calculate stats and filter attempts using utility functions
  const { stats, searchFiltered } = calculateQuizStats(safeQuizAttempts, searchTerm, filterBy);
  const filteredAttempts = filterAndSortAttempts(searchFiltered, filterBy, sortBy, sortOrder);

  const handleDeleteQuiz = useCallback(
    async (quizId: string, title: string) => {
      if (
        !window.confirm(
          `Are you sure you want to delete "${title}"? This action cannot be undone.`
        )
      ) {
        return;
      }

      setDeletingQuizId(quizId);

      // Optimistically update the cache immediately for better UX
          queryClient.setQueryData(
            BACKEND_QUIZ_KEYS.userAttempts(userId),
        (oldData: QuizAttempt[] | { data: QuizAttempt[]; success: boolean; error: string | null } | undefined) => {
          // Handle both transformed array data and raw ApiResponse format
              if (!oldData) return [];
          
          // If oldData is an array (transformed by select function)
          if (Array.isArray(oldData)) {
              return oldData.filter((attempt) => attempt.quiz_id !== quizId);
            }
          
          // If oldData is in ApiResponse format (raw cached data)
          if ('data' in oldData && Array.isArray(oldData.data)) {
            return {
              ...oldData,
              data: oldData.data.filter((attempt: QuizAttempt) => attempt.quiz_id !== quizId)
            };
          }
          
          // Fallback to empty array
          return [];
        }
      );

      try {
        // The mutation already handles cache invalidation in its onSuccess callback
        await deleteQuizMutation.mutateAsync({ quizId, userId });
        toast.success("Quiz deleted successfully!");
      } catch (error) {
        console.error("Delete quiz error:", error);
        toast.error("Failed to delete quiz");

        // Revert optimistic update on error by invalidating the cache
        queryClient.invalidateQueries({
          queryKey: BACKEND_QUIZ_KEYS.userAttempts(userId),
        });
      } finally {
        setDeletingQuizId(null);
      }
    },
    [deleteQuizMutation, userId, queryClient]
  );





  // Single loading screen for all loading states - matching dashboard pattern
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
              Loading Quiz History...
            </h2>
            <p className="text-gray-400">
              Preparing your quiz performance data
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-6">
        <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-700/50 px-2 sm:px-3"
              >
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Quiz History
              </h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                Track your quiz performance over time
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-4 sm:p-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">
                  Total Quizzes
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {stats.totalQuizzes}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.completedQuizzes} completed
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-4 sm:p-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">
                  Average Score
                </p>
                <p
                  className={`text-xl sm:text-2xl font-bold ${getScoreColors(stats.averageScore).text}`}
                >
                  {stats.completedQuizzes + stats.incompleteQuizzes > 0
                    ? stats.averageScore.toFixed(1)
                    : "--"}
                  %
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-4 sm:p-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">
                  Pass Rate
                </p>
                <p
                  className={`text-xl sm:text-2xl font-bold ${getScoreColors(stats.passRate).text}`}
                >
                  {stats.completedQuizzes > 0
                    ? stats.passRate.toFixed(1)
                    : "--"}
                  %
                </p>
                <p className="text-xs text-gray-500">
                  {stats.passedQuizzes}/{stats.completedQuizzes} passed
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-4 sm:p-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">
                  Avg Time
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {stats.completedQuizzes > 0
                    ? stats.averageTime.toFixed(1)
                    : "--"}
                  <span className="text-sm sm:text-base font-normal text-gray-400 ml-1">
                    min
                  </span>
                </p>
                <p className="text-xs text-gray-500">Per completed quiz</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-gray-300 hover:text-white hover:bg-gray-700/50 w-full sm:w-auto justify-center sm:justify-start"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </Button>
            </div>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-700/50"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as "date" | "score" | "title")
                    }
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm sm:text-base"
                  >
                    <option value="date">Date</option>
                    <option value="score">Score</option>
                    <option value="title">Title</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) =>
                      setSortOrder(e.target.value as "asc" | "desc")
                    }
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm sm:text-base"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Filter
                  </label>
                  <select
                    value={filterBy}
                    onChange={(e) =>
                      setFilterBy(
                        e.target.value as
                          | "all"
                          | "completed"
                          | "incomplete"
                          | "not_attempted"
                          | "passed"
                          | "failed"
                      )
                    }
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm sm:text-base"
                  >
                    <option value="all">All Quizzes</option>
                    <option value="completed">Completed</option>
                    <option value="incomplete">Incomplete</option>
                    <option value="not_attempted">Not Attempted</option>
                    <option value="passed">Passed (≥70%)</option>
                    <option value="failed">Failed (&lt;70%)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quiz Attempts List */}
        <div className="space-y-4">
          {filteredAttempts?.length === 0 ? (
            <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-8">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {stats.totalQuizzes === 0
                    ? "No Quizzes Created Yet"
                    : searchTerm || filterBy !== "all"
                      ? "No Quizzes Match Your Filters"
                      : "No Quiz Activity Yet"}
                </h3>
                <p className="text-gray-400">
                  {stats.totalQuizzes === 0
                    ? "Create your first quiz to start your learning journey!"
                    : searchTerm || filterBy !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "You have created quizzes but haven't taken any yet. Start with your first quiz!"}
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/quiz/create">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      Create New Quiz
                    </Button>
                  </Link>
                  {stats.totalQuizzes > 0 && (
                    <Link href="/dashboard">
                      <Button
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                      >
                        View Dashboard
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAttempts?.map((attempt: QuizAttempt) => (
                <div
                  key={`${attempt.quiz_id}-${attempt.completed_at}`}
                  className="w-full"
                >
                  <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-4 sm:p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2 sm:mb-0">
                            <h3 className="text-lg sm:text-xl font-semibold text-white truncate">
                              {attempt.title}
                            </h3>

                            {/* Status Badge */}
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(attempt.status)} w-fit`}
                            >
                              {(() => {
                                const iconConfig = getStatusIconConfig(attempt.status);
                                switch (iconConfig.icon) {
                                  case "CheckCircle":
                                    return <CheckCircle className={iconConfig.className} />;
                                  case "Pause":
                                    return <Pause className={iconConfig.className} />;
                                  case "CircleDot":
                                    return <CircleDot className={iconConfig.className} />;
                                  case "AlertCircle":
                                    return <AlertCircle className={iconConfig.className} />;
                                  default:
                                    return <CircleDot className={iconConfig.className} />;
                                }
                              })()}
                              <span className="ml-1.5 capitalize">
                                {attempt.status.replace("_", " ")}
                              </span>
                            </span>
                          </div>

                          {/* Score Badge (only for completed quizzes) - Mobile friendly */}
                          {attempt.status === "completed" && (
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getScoreColors(attempt.score_percentage).badge} w-fit`}
                            >
                              {attempt.score_percentage >= 70 ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {attempt.score_percentage.toFixed(1)}%
                            </span>
                          )}
                        </div>

                        {attempt.topic_name && (
                          <p className="text-sm text-blue-400 mb-2">
                            📚 {attempt.topic_name}
                          </p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {attempt.completed_at
                                ? formatDate(attempt.completed_at)
                                : `Created ${formatDate(attempt.created_at)}`}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Target className="h-4 w-4" />
                            <span>
                              {attempt.status === "incomplete" &&
                              attempt.answered_questions
                                ? `${attempt.answered_questions}/${attempt.total_questions} answered`
                                : `${attempt.correct_answers}/${attempt.total_questions} correct`}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>
                              {attempt.time_spent_minutes > 0
                                ? `${attempt.time_spent_minutes.toFixed(1)} minutes`
                                : "Not started"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-400">
                            <BarChart3 className="h-4 w-4" />
                            <span>{attempt.completion_status}</span>
                          </div>
                        </div>
                      </div>

                      <div className="ml-6 text-right space-y-2">
                        {/* Score Display */}
                        {attempt.status === "completed" ? (
                          <>
                            <div
                              className={`text-3xl font-bold ${getScoreColors(attempt.score_percentage).text}`}
                            >
                              {attempt.score_percentage.toFixed(0)}%
                            </div>
                            {attempt.score_percentage >= 70 ? (
                              <div className="flex items-center text-emerald-400 text-sm">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                <span>Passed</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-red-400 text-sm">
                                <TrendingDown className="h-4 w-4 mr-1" />
                                <span>Failed</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-2xl font-bold text-gray-400">
                            {attempt.status === "incomplete"
                              ? `${Math.round(((attempt.answered_questions || 0) / attempt.total_questions) * 100)}%`
                              : "--"}
                          </div>
                        )}

                        {/* Action Button */}
                        <div className="mt-3">
                  <QuizActionGroup
                    attempt={attempt}
                    onDelete={handleDeleteQuiz}
                    isDeleting={deletingQuizId === attempt.quiz_id}
                  />
                </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
