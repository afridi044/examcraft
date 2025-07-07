"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Trophy,
  Clock,
  Target,
  BookOpen,
  Loader2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useQueryClient } from "@tanstack/react-query";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useDeleteBackendQuiz } from "@/hooks/useBackendQuiz";
import { useBackendUserQuizAttempts, BACKEND_QUIZ_KEYS } from "@/hooks/useBackendQuiz";
import { toast } from "react-hot-toast";
import {
  getScoreColors,
  calculateQuizStats,
  filterAndSortAttempts,
} from "@/lib/utils/quiz-history";
import type { QuizAttempt } from "@/types";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { QuizAttemptCard } from "@/components/features/quiz-history/QuizAttemptCard";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { DashboardSearchBar } from "@/components/ui/dashboard-search-bar";
import { FilterDropdown, FilterOption } from "@/components/ui/filter-dropdown";
import { SortDropdown, SortOption } from "@/components/ui/sort-dropdown";

export default function QuizHistoryPage() {
  const { user: currentUser, loading: userLoading } = useBackendAuth();
  const deleteQuizMutation = useDeleteBackendQuiz();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Scroll to top when navigating
  useScrollToTop();

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "score" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterBy, setFilterBy] = useState<
    "all" | "completed" | "incomplete" | "not_attempted" | "passed" | "failed"
  >("all");
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);

  // Filter dropdown options
  const FILTER_OPTIONS: FilterOption[] = [
    { id: "all", label: "All Quizzes" },
    { id: "completed", label: "Completed" },
    { id: "incomplete", label: "Incomplete" },
    { id: "not_attempted", label: "Not Attempted" },
    { id: "passed", label: "Passed (≥70%)" },
    { id: "failed", label: "Failed (<70%)" },
  ];

  const SORT_OPTIONS: SortOption[] = [
    { id: "date_desc", label: "Date (Newest)", icon: Calendar },
    { id: "date_asc", label: "Date (Oldest)", icon: Calendar },
    { id: "score_desc", label: "Score (High → Low)", icon: Trophy },
    { id: "score_asc", label: "Score (Low → High)", icon: Trophy },
  ];

  // Use the database user_id
  const userId = currentUser?.id || "";

  // FIXED: Redirect to landing page if not authenticated and not loading
  useEffect(() => {
    if (!userLoading && !currentUser) {
      router.push("/");
    }
  }, [userLoading, currentUser]); // Removed router from dependencies to prevent unnecessary re-runs

  // Refresh quiz attempts when user returns to page to ensure real-time updates
  useEffect(() => {
    if (currentUser) {
      // Check if data is stale and invalidate if needed
      const queryState = queryClient.getQueryState(["backend", "quiz", "attempts"]);
      const isStale = !queryState || (Date.now() - (queryState.dataUpdatedAt || 0)) > 30000; // 30 seconds

      if (isStale) {
        queryClient.invalidateQueries({
          queryKey: ["backend", "quiz", "attempts"],
        });
      }
    }
  }, [currentUser, queryClient]);

  // OPTIMIZED: Use the new secure backend hook (no userId needed - uses JWT token)
  const {
    data: quizAttempts,
    isLoading: loadingAttempts,
  } = useBackendUserQuizAttempts();

  // Simplified loading state
  const showLoadingScreen = userLoading || (userId && loadingAttempts && !quizAttempts);

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
        ["backend", "quiz", "attempts"],
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
        await deleteQuizMutation.mutateAsync(quizId);
        toast.success("Quiz deleted successfully!");
      } catch (error) {
        console.error("Delete quiz error:", error);
        toast.error("Failed to delete quiz");

        // Revert optimistic update on error by invalidating the cache
        queryClient.invalidateQueries({
          queryKey: ["backend", "quiz", "attempts"],
        });
      } finally {
        setDeletingQuizId(null);
      }
    },
    [deleteQuizMutation, queryClient]
  );

  const handleSortSelect = (id: string) => {
    if (id.startsWith("date")) setSortBy("date");
    else if (id.startsWith("score")) setSortBy("score");
    else setSortBy("title");

    setSortOrder(id.endsWith("asc") ? "asc" : "desc");
  };

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
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-2"
        >
          <DashboardHeader
            title="Quiz History"
            subtitle="Track your quiz performance over time"
          />
        </motion.div>

        {/* Statistics Overview */}
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
                value={stats.totalQuizzes}
                label="Total Quizzes"
                rightIcon={<BookOpen className="h-6 w-6 text-white" />}
                cardClass="bg-gradient-to-br from-[#1967D2] to-[#174ea6] border-none"
                textClass="text-white"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="md:hover:scale-105 md:hover:-translate-y-1 transition-transform duration-200"
            >
              <StatCard
                value={stats.completedQuizzes + stats.incompleteQuizzes > 0 ? `${stats.averageScore.toFixed(1)}%` : "--%"}
                label="Average Score"
                rightIcon={<Trophy className="h-6 w-6 text-white" />}
                cardClass="bg-gradient-to-br from-[#0F9D58] to-[#0b6b43] border-none"
                textClass={getScoreColors(stats.averageScore).text + " font-bold"}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="md:hover:scale-105 md:hover:-translate-y-1 transition-transform duration-200"
            >
              <StatCard
                value={stats.completedQuizzes > 0 ? `${stats.passRate.toFixed(1)}%` : "--%"}
                label="Pass Rate"
                rightIcon={<Target className="h-6 w-6 text-white" />}
                cardClass="bg-gradient-to-br from-[#9C27B0] to-[#6d1b7b] border-none"
                textClass={getScoreColors(stats.passRate).text + " font-bold"}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="md:hover:scale-105 md:hover:-translate-y-1 transition-transform duration-200"
            >
              <StatCard
                value={stats.completedQuizzes > 0 ? stats.averageTime.toFixed(1) : "--"}
                label="Avg Time"
                rightIcon={<Clock className="h-6 w-6 text-white" />}
                cardClass="bg-gradient-to-br from-[#F2A900] to-[#b97b16] border-none"
                textClass="text-white"
                sublabel="min"
                sublabelClass="text-white/80 ml-1"
                inlineSublabel
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, ease: "easeOut" }}
          className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700/50 p-3 sm:p-4 md:p-6"
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full">
              <DashboardSearchBar
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Dropdowns beside search bar */}
            <div className="flex items-center space-x-2">
              <FilterDropdown
                options={FILTER_OPTIONS}
                selectedId={filterBy}
                onSelect={(id) =>
                  setFilterBy(id as "all" | "completed" | "incomplete" | "not_attempted" | "passed" | "failed")
                }
              />
              <SortDropdown
                options={SORT_OPTIONS}
                selectedId={`${sortBy}_${sortOrder}`}
                onSelect={handleSortSelect}
              />
            </div>
          </div>
        </motion.div>

        {/* Quiz Attempts List */}
        <motion.div
          className="space-y-3 sm:space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, staggerChildren: 0.05 }}
        >
          {filteredAttempts?.length === 0 ? (
            <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-6 sm:p-8">
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white">
                  {stats.totalQuizzes === 0
                    ? "No Quizzes Created Yet"
                    : searchTerm || filterBy !== "all"
                      ? "No Quizzes Match Your Filters"
                      : "No Quiz Activity Yet"}
                </h3>
                <p className="text-gray-400 text-sm sm:text-base">
                  {stats.totalQuizzes === 0
                    ? "Create your first quiz to start your learning journey!"
                    : searchTerm || filterBy !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "You have created quizzes but haven't taken any yet. Start with your first quiz!"}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/quiz/create">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 w-full sm:w-auto">
                      Create New Quiz
                    </Button>
                  </Link>
                  {stats.totalQuizzes > 0 && (
                    <Link href="/dashboard">
                      <Button
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700/50 w-full sm:w-auto"
                      >
                        View Dashboard
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 overflow-visible"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.05 }
                }
              }}
            >
              {filteredAttempts?.map((attempt: QuizAttempt) => (
                <motion.div
                  key={`${attempt.quiz_id}-${attempt.completed_at}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  layout
                >
                  <QuizAttemptCard
                    attempt={attempt}
                    onDelete={handleDeleteQuiz}
                    isDeleting={deletingQuizId === attempt.quiz_id}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
