"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  RotateCcw,
  XCircle,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { QuestionCard } from "@/components/features/quiz-review/QuestionCard";
import { PerformanceSummary } from "@/components/features/quiz-review/PerformanceSummary";
import { useCurrentUser } from "@/hooks/useDatabase";
import { useBackendQuizReview, useInvalidateBackendQuiz } from "@/hooks/useBackendQuiz";
import { formatTime, getDifficultyColor, getDifficultyLabel } from "@/lib/utils/quiz-review";
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import type { QuizReviewData } from "@/types";
import { flashcardService } from "@/lib/services";
import toast from "react-hot-toast";
import { useBackendAuth } from "@/hooks/useBackendAuth";

export default function QuizReviewPage() {
  const { user, loading: authLoading } = useBackendAuth();
  const router = useRouter();
  const params = useParams();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  // Flashcard status is displayed from backend data with creation functionality
  const [processingQuestionId, setProcessingQuestionId] = useState<string | null>(null);
  const invalidateQuiz = useInvalidateBackendQuiz();

  const quizId = params.quizId as string;

  // Use React Query hook for data fetching
  const {
    data: reviewData,
    isLoading: loading,
    error: reviewError,
  } = useBackendQuizReview(quizId, currentUser?.user_id || "");

  const error = reviewError?.message || null;

  // Clear processing state when new data is loaded
  useEffect(() => {
    if (reviewData?.questions) {
      setProcessingQuestionId(null);
    }
  }, [reviewData?.questions]);

  // FIXED: Redirect to landing page if not authenticated and not loading
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [authLoading, user]); // Removed router from dependencies to prevent unnecessary re-runs

  // Improved loading logic - wait for all required data
  const showFullLoadingScreen = authLoading || userLoading || loading || !currentUser?.user_id || !reviewData;

  // Flashcard creation function
  const createFlashcard = async (questionId: string): Promise<void> => {
    if (!currentUser) {
      toast.error("Please log in to create flashcards");
      return;
    }

    // Set processing state
    setProcessingQuestionId(questionId);

    try {
      const response = await flashcardService.createFromQuestion({
        questionId: questionId,
        userId: currentUser.user_id,
        topicId: reviewData?.quiz?.topic?.topic_id, // Use quiz's topic if available
      });

      if (response.success) {
        toast.success("Flashcard created successfully!");
        // Invalidate the quiz review cache to get updated flashcard status from backend
        invalidateQuiz(currentUser.user_id, quizId);
        // Keep processing state until new data is loaded (handled in useEffect above)
      } else {
        throw new Error(response.error || "Failed to create flashcard");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create flashcard"
      );
      // Clear processing state on error
      setProcessingQuestionId(null);
    }
  };

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

  if (error || (!loading && !reviewData)) {
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
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <DashboardHeader
          title={`Quiz Review: ${reviewData.quiz.title}`}
          subtitle={reviewData.quiz.topic?.name || reviewData.quiz.description || "Review your quiz performance"}
          iconLeft={<span role="img" aria-label="Memo">📝</span>}
          iconAfterSubtitle={<Star className="h-5 w-5 text-yellow-300 ml-1" />}
        />

        {/* Performance Summary */}
        <PerformanceSummary stats={reviewData.quiz_stats} formatTime={formatTime} />

        {/* Centered Retake Button */}
        <div className="flex justify-center pt-4">
          <PremiumButton
            onClick={() => router.push(`/quiz/take/${quizId}`)}
            className="text-sm sm:text-base min-h-[40px]"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Retake</span> Quiz
          </PremiumButton>
        </div>

        {/* Questions Review */}
        <div className="space-y-4 sm:space-y-6">
          <DashboardHeader
            title="Question Review"
            subtitle=""
            iconLeft={<BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />}
          />

          {reviewData.questions.map((question: QuizReviewData['questions'][number], index: number) => (
            <QuestionCard
              key={question.question_id}
              question={question}
              index={index}
              onCreateFlashcard={createFlashcard}
              formatTime={formatTime}
              getDifficultyColor={getDifficultyColor}
              getDifficultyLabel={getDifficultyLabel}
              isProcessing={processingQuestionId === question.question_id}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
