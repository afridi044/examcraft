"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { QuestionCard } from "@/components/features/quiz-review/QuestionCard";
import { PerformanceSummary } from "@/components/features/quiz-review/PerformanceSummary";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useCurrentUser } from "@/hooks/useDatabase";
import { useBackendQuizReview } from "@/hooks/useBackendQuiz";
import { flashcardService } from "@/lib/services";
import { formatTime, getDifficultyColor, getDifficultyLabel } from "@/lib/utils/quiz-review";
import toast from "react-hot-toast";
import type { QuizReviewData } from "@/types";



export default function QuizReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useBackendAuth();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const [flashcardStates, setFlashcardStates] = useState<
    Record<string, "idle" | "creating" | "created" | "exists">
  >({});


  const quizId = params.quizId as string;

  // Use React Query hook for data fetching
  const {
    data: reviewData,
    isLoading: loading,
    error: reviewError,
  } = useBackendQuizReview(quizId, currentUser?.user_id || "");

  const error = reviewError?.message || null;

  // FIXED: Redirect to landing page if not authenticated and not loading
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [authLoading, user]); // Removed router from dependencies to prevent unnecessary re-runs



  const generateFlashcard = async (questionId: string) => {
    if (!currentUser) {
      toast.error("Please log in to create flashcards");
      return;
    }

    setFlashcardStates((prev) => ({ ...prev, [questionId]: "creating" }));

    try {
      // MIGRATED: Use backend flashcard service instead of frontend API route
      const response = await flashcardService.createFromQuestion({
        questionId: questionId,
        userId: currentUser.user_id,
        topicId: undefined, // Let backend determine topic from question
      });

      if (response.success) {
        setFlashcardStates((prev) => ({ ...prev, [questionId]: "created" }));
        toast.success("Flashcard created successfully!");

        // Reset to idle after 3 seconds to show the success state briefly
        setTimeout(() => {
          setFlashcardStates((prev) => ({ ...prev, [questionId]: "idle" }));
        }, 3000);
      } else {
        // Check if it's a conflict (flashcard already exists)
        if (response.error?.includes("already exists") || response.error?.includes("duplicate")) {
          setFlashcardStates((prev) => ({ ...prev, [questionId]: "exists" }));
          toast("Flashcard already exists for this question");
        } else {
          throw new Error(response.error || "Failed to create flashcard");
        }
      }
    } catch (error) {
      setFlashcardStates((prev) => ({ ...prev, [questionId]: "idle" }));
      toast.error(
        error instanceof Error ? error.message : "Failed to create flashcard"
      );
    }
  };

  // Simplified loading logic
  const showFullLoadingScreen = authLoading || userLoading || loading;

  if (showFullLoadingScreen) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-2xl blur-xl"></div>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              Loading Quiz Review...
            </h2>
            <p className="text-gray-400">Preparing your quiz analysis</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !reviewData) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="bg-gray-800/50 border-gray-700/50 p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              Review Not Available
            </h2>
            <p className="text-gray-400 mb-4">
              {error || "Unable to load quiz review data"}
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Return to Dashboard
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4 sm:p-8 lg:p-20 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-start space-x-3 sm:space-x-4">
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              size="icon"
              className="border-gray-600/50 text-gray-400 hover:border-purple-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-200 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                Quiz Review: {reviewData.quiz.title}
              </h1>
              <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
                {reviewData.quiz.description || "Review your quiz performance"}
              </p>
              {reviewData.quiz.topic && (
                <p className="text-xs sm:text-sm text-purple-400 mt-1 font-medium">
                  Topic: {reviewData.quiz.topic.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => router.push(`/quiz/take/${quizId}`)}

              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-4 sm:px-6 py-2 shadow-lg hover:shadow-purple-500/25 transition-all duration-200 text-sm sm:text-base min-h-[44px]"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Retake</span> Quiz
            </Button>
          </div>
        </div>

        {/* Performance Summary */}
        <PerformanceSummary stats={reviewData.quiz_stats} formatTime={formatTime} />

        {/* Questions Review */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Question Review
            </h2>
          </div>

          {reviewData.questions.map((question, index) => (
            <QuestionCard
              key={question.question_id}
              question={question}
              index={index}
              flashcardState={flashcardStates[question.question_id] || "idle"}
              onGenerateFlashcard={generateFlashcard}
              formatTime={formatTime}
              getDifficultyColor={getDifficultyColor}
              getDifficultyLabel={getDifficultyLabel}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 pt-8 sm:pt-12">
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-6 sm:px-8 py-3 shadow-lg hover:shadow-purple-500/25 transition-all duration-200 w-full sm:w-auto min-h-[48px]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
          <Button
            onClick={() => router.push("/quiz/create")}
            variant="outline"
            className="border-gray-600/50 text-gray-300 hover:border-blue-400 hover:text-blue-400 hover:bg-blue-500/10 font-medium px-6 sm:px-8 py-3 transition-all duration-200 w-full sm:w-auto min-h-[48px]"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Create New Quiz
          </Button>
          <Button
            onClick={() => router.push(`/quiz/take/${quizId}`)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium px-6 sm:px-8 py-3 shadow-lg hover:shadow-blue-500/25 transition-all duration-200 w-full sm:w-auto min-h-[48px]"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Quiz
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
