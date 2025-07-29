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
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useBackendQuizReview, useInvalidateBackendQuiz, useUpdateQuizFlashcardStatus } from "@/hooks/useBackendQuiz";
import { formatTime, getDifficultyColor, getDifficultyLabel } from "@/lib/utils/quiz-review";
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { PageLoading } from "@/components/ui/loading";
import type { QuizReviewData } from "@/types";
import { flashcardService } from "@/lib/services";
import toast from "react-hot-toast";
import { useTheme } from "@/contexts/ThemeContext";

export default function QuizReviewPage() {
  const { user: currentUser, loading: userLoading, setSignOutMessage } = useBackendAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const params = useParams();
  // Flashcard status is displayed from backend data with creation functionality
  const [processingQuestionId, setProcessingQuestionId] = useState<string | null>(null);
  // Optimistic updates for flashcard creation
  const [optimisticFlashcardStatus, setOptimisticFlashcardStatus] = useState<Record<string, boolean>>({});
  const invalidateQuiz = useInvalidateBackendQuiz();
  const updateFlashcardStatus = useUpdateQuizFlashcardStatus();

  const quizId = params.quizId as string;

  // Use React Query hook for data fetching
  const {
    data: reviewData,
    isLoading: loading,
    error: reviewError,
  } = useBackendQuizReview(quizId);

  const error = reviewError?.message || null;

  // Clear processing state when new data is loaded
  useEffect(() => {
    if (reviewData?.questions) {
      setProcessingQuestionId(null);
    }
  }, [reviewData?.questions]);

  // EARLY REDIRECT: Check authentication immediately after render
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

  // Improved loading logic - wait for all required data
  const showFullLoadingScreen = userLoading || loading || !currentUser || !reviewData;

  // Flashcard creation function with optimistic updates
  const createFlashcard = async (questionId: string): Promise<void> => {
    if (!currentUser) {
      toast.error("Please log in to create flashcards");
      return;
    }

    // Set processing state and optimistic update
    setProcessingQuestionId(questionId);
    setOptimisticFlashcardStatus(prev => ({ ...prev, [questionId]: true }));

    try {
      const response = await flashcardService.createFromQuestion({
        questionId: questionId,
        topicId: reviewData?.quiz?.topic?.topic_id, // Use quiz's topic if available
      });

      if (response.success) {
        toast.success("Flashcard created successfully!");
        // Clear processing state immediately - optimistic update already shows success
        setProcessingQuestionId(null);
        // Update cache with granular update instead of full invalidation
        updateFlashcardStatus(quizId, questionId, true);
        // Clear optimistic state since cache is now updated
        setOptimisticFlashcardStatus(prev => {
          const newState = { ...prev };
          delete newState[questionId];
          return newState;
        });
      } else {
        throw new Error(response.error || "Failed to create flashcard");
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticFlashcardStatus(prev => {
        const newState = { ...prev };
        delete newState[questionId];
        return newState;
      });

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
        <PageLoading
          title="Loading Quiz Review"
          subtitle="Preparing your quiz analysis"
          variant="quiz"
        />
      </DashboardLayout>
    );
  }

  if (error || (!loading && !reviewData)) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className={`p-8 text-center ${
            isDark
              ? "bg-gradient-to-br from-red-900/50 to-red-800/50 border-red-700/50"
              : "bg-gradient-to-br from-red-50 to-red-100 border-red-300/50"
          }`}>
            <XCircle className={`h-12 w-12 mx-auto mb-4 ${
              isDark ? "text-red-400" : "text-red-600"
            }`} />
            <h2 className={`text-xl font-bold mb-2 ${
              isDark ? "text-white" : "text-red-900"
            }`}>
              Review Not Available
            </h2>
            <p className={`mb-4 ${
              isDark ? "text-gray-300" : "text-red-700"
            }`}>
              {error || "Unable to load quiz review data"}
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-purple-500 hover:bg-purple-600 text-white"
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
          isDark={isDark}
        />

        {/* Performance Summary */}
        <PerformanceSummary stats={reviewData.quiz_stats} formatTime={formatTime} isDark={isDark} />

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
            isDark={isDark}
          />

          {reviewData.questions.map((question: QuizReviewData['questions'][number], index: number) => {
            // Use optimistic status if available, otherwise use backend data
            const flashcardExists = optimisticFlashcardStatus[question.question_id] ?? question.flashcard_exists;
            const questionWithOptimisticStatus = {
              ...question,
              flashcard_exists: flashcardExists
            };

            return (
              <QuestionCard
                key={question.question_id}
                question={questionWithOptimisticStatus}
                index={index}
                onCreateFlashcard={createFlashcard}
                formatTime={formatTime}
                getDifficultyColor={getDifficultyColor}
                getDifficultyLabel={getDifficultyLabel}
                isProcessing={processingQuestionId === question.question_id}
                isDark={isDark}
              />
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
