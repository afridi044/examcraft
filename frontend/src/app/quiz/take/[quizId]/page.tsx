"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useInvalidateBackendQuiz } from "@/hooks/useBackendQuiz";
import { useInvalidateBackendDashboard } from "@/hooks/useBackendDashboard";
import { useInvalidateFlashcards } from "@/hooks/useBackendFlashcards";
import { useBackendQuizWithQuestions } from "@/hooks/useBackendQuiz";
import { QuizTakingQuestionCard } from "@/components/features/quiz/QuizTakingQuestionCard";
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { PageLoading } from "@/components/ui/loading";
import { QuizResultsScreen } from "@/components/ui/QuizResultsScreen";

import { quizService } from "@/lib/services";
import {
  Clock,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Flag,
  Trophy,
  BookOpen,
  Loader2,
  Star,
  Target,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface UserAnswer {
  question_id: string;
  selected_option_id?: string;
  text_answer?: string;
  is_correct?: boolean;
  time_taken_seconds: number;
}

interface QuizResult {
  score: number;
  percentage: number;
  correct_answers: number;
  total_questions: number;
  time_taken: string;
  answers: UserAnswer[];
}

export default function TakeQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;
  const { user: currentUser, loading: userLoading, setSignOutMessage } = useBackendAuth();
  const invalidateBackendQuiz = useInvalidateBackendQuiz();
  const invalidateBackendDashboard = useInvalidateBackendDashboard();
  const invalidateFlashcards = useInvalidateFlashcards();

  // EARLY REDIRECT: Check authentication immediately after render
  useEffect(() => {
    if (!userLoading && !currentUser) {
      setSignOutMessage();
      router.push("/auth/signin");
    }
  }, [userLoading, currentUser, router, setSignOutMessage]);

  // Only invalidate data if it's stale or on explicit user action
  // Removed automatic invalidation on mount for better performance

  // OPTIMIZED: Removed debug logging for performance
  const { data: quiz, isLoading } = useBackendQuizWithQuestions(quizId);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, UserAnswer>>(
    new Map()
  );
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // OPTIMIZED: Memoized derived values
  const {
    questions,
    currentQuestion,
    isLastQuestion,
    hasAnsweredCurrent,
    progressPercentage,
  } = useMemo(() => {
    const questions = quiz?.questions || [];
    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const hasAnsweredCurrent = userAnswers.has(
      currentQuestion?.question_id || ""
    );
    const progressPercentage =
      questions.length > 0
        ? ((currentQuestionIndex + 1) / questions.length) * 100
        : 0;

    return {
      questions,
      currentQuestion,
      isLastQuestion,
      hasAnsweredCurrent,
      progressPercentage,
    };
  }, [quiz?.questions, currentQuestionIndex, userAnswers]);

  // OPTIMIZED: Timer with reduced update frequency and memoized callback
  const updateTimer = useCallback(() => {
    if (!quizStartTime) return;
    const newTimeElapsed = Math.floor(
      (Date.now() - quizStartTime.getTime()) / 1000
    );
    setTimeElapsed((prev) => (prev !== newTimeElapsed ? newTimeElapsed : prev));
  }, [quizStartTime]);

  useEffect(() => {
    if (!quizStartTime) return;

    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [updateTimer]);

  // Initialize quiz
  useEffect(() => {
    if (quiz && !quizStartTime) {
      setQuizStartTime(new Date());
      setQuestionStartTime(new Date());
    }
  }, [quiz, quizStartTime]);

  // Update question start time when question changes
  useEffect(() => {
    setQuestionStartTime(new Date());
  }, [currentQuestionIndex]);

  // OPTIMIZED: Memoized time formatting
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  // Don't render anything while redirecting
  if (!userLoading && !currentUser) {
    return null;
  }

  const handleAnswerSelect = useCallback(
    (optionId: string, textAnswer?: string) => {
      if (!currentQuestion || !questionStartTime) return;

      const timeTaken = Math.floor(
        (Date.now() - questionStartTime.getTime()) / 1000
      );
      const correctOption = currentQuestion.question_options?.find(
        (opt: any) => opt.is_correct
      );
      const isCorrect = Boolean(
        correctOption?.option_id === optionId ||
        (textAnswer &&
          correctOption?.content.toLowerCase() === textAnswer.toLowerCase())
      );

      const answer: UserAnswer = {
        question_id: currentQuestion.question_id,
        selected_option_id: optionId || undefined, // Convert empty string to undefined
        text_answer: textAnswer || undefined, // Convert empty string to undefined
        is_correct: isCorrect,
        time_taken_seconds: timeTaken,
      };

      setUserAnswers((prev) =>
        new Map(prev).set(currentQuestion.question_id, answer)
      );
    },
    [currentQuestion, questionStartTime]
  );

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!currentUser || !quiz || !quizStartTime) return;

    setIsSubmitting(true);
    try {
      // Calculate results
      const totalQuestions = questions.length;
      const correctAnswers = Array.from(userAnswers.values()).filter(
        (a) => a.is_correct
      ).length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const totalTimeSeconds = Math.floor(
        (Date.now() - quizStartTime.getTime()) / 1000
      );

      // OPTIMIZED: Batch submit answers with minimal logging
      const submitPromises = Array.from(userAnswers.values()).map(
        async (answer) => {
          // MIGRATED: Use backend quiz service instead of frontend API route
          const response = await quizService.submitAnswer({
            questionId: answer.question_id,
            selectedOptionId: answer.selected_option_id,
            textAnswer: answer.text_answer,
            isCorrect: answer.is_correct,
            quizId: quizId,
            timeTaken: answer.time_taken_seconds,
          });

          if (!response.success) {
            throw new Error(
              response.error || `Failed to submit answer for question ${answer.question_id}`
            );
          }

          return response.data;
        }
      );

      // Wait for all submissions to complete
      await Promise.all(submitPromises);

      // Invalidate caches to ensure fresh data on navigation
      invalidateBackendQuiz(quizId);
      invalidateBackendDashboard();
      // Also invalidate flashcards since quiz answers might affect flashcard existence
      invalidateFlashcards({ includeExistence: true });

      const result: QuizResult = {
        score,
        percentage: score,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
        time_taken: formatTime(totalTimeSeconds),
        answers: Array.from(userAnswers.values()),
      };

      setQuizResult(result);
      toast.success("Quiz completed successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit quiz"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Improved loading logic - don't show loading state when user is signing out
  const isMainLoading = userLoading;
  const isDataLoading = isLoading;

  // Show full loading screen for both auth and initial data load, but not during sign out
  const showFullLoadingScreen = isMainLoading || isDataLoading;

  if (showFullLoadingScreen) {
    return (
      <DashboardLayout>
        <PageLoading
          title="Loading Quiz..."
          subtitle="Preparing your quiz questions"
          variant="quiz"
        />
      </DashboardLayout>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="bg-gray-800/50 border-gray-700/50 p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              Quiz Not Found
            </h2>
            <p className="text-gray-400 mb-4">
              This quiz doesn&apos;t exist or has no questions.
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

  // Results View
  if (quizResult) {
    return (
      <DashboardLayout>
        <QuizResultsScreen
          score={quizResult.percentage}
          correctAnswers={quizResult.correct_answers}
          totalQuestions={quizResult.total_questions}
          timeTaken={quizResult.time_taken}
          primaryAction={{
            label: "View Detailed Review",
            onClick: () => router.push(`/quiz/review/${quizId}`),
            icon: <BookOpen className="h-5 w-5" />
          }}
          secondaryActions={[
            {
              label: "Create Another Quiz",
              onClick: () => router.push("/quiz/create"),
              icon: <BookOpen className="h-4 w-4" />
            },
            {
              label: "Back to Quizzes",
              onClick: () => router.push("/dashboard/quiz-history"),
              icon: <ArrowLeft className="h-4 w-4" />
            }
          ]}
        />
      </DashboardLayout>
    );
  }

  // Quiz Taking View
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Quiz Header */}
        <DashboardHeader
          title={quiz.title}
          subtitle={quiz.description || "Answer the questions below"}
          iconLeft={<div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-white" />
          </div>}
          rightContent={
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Clock className="h-4 w-4" />
                <span className="text-sm sm:text-base">
                  {formatTime(timeElapsed)}
                </span>
              </div>
              <div className="text-gray-300 text-sm sm:text-base">
                {currentQuestionIndex + 1} / {questions.length}
              </div>
            </div>
          }
        />
        {/* Timer section removed as it's now in DashboardHeader */}

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <QuizTakingQuestionCard
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            userAnswer={userAnswers.get(currentQuestion.question_id)}
            onAnswerSelect={handleAnswerSelect}
          />
        )}

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <Button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white border-0 shadow-lg shadow-slate-900/30 disabled:opacity-50 disabled:shadow-none w-full sm:w-auto min-h-[48px] px-5"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {/* Static, non-clickable navigation dots (show up to 5, rotate with current question) */}
          <div className="flex space-x-1 sm:space-x-2 justify-center w-full sm:w-auto">
            {(() => {
              const total = questions.length;
              if (total === 0) return null;

              // Determine group of 5 based on current question index
              const groupStart = Math.floor(currentQuestionIndex / 5) * 5;
              const groupEnd = Math.min(groupStart + 5, total);

              const indexes = Array.from({ length: groupEnd - groupStart }, (_, i) => i + groupStart);

              return indexes.map((index) => {
                const question = questions[index];
                const isAnswered = userAnswers.has(question?.question_id || "");
                const isCurrent = index === currentQuestionIndex;

                return (
                  <div
                    key={index}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full text-sm flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isCurrent
                        ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30 border border-purple-400/30"
                        : isAnswered
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm shadow-green-500/20 border border-green-400/30"
                          : "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-400 border border-gray-600/30"
                      }`}
                  >
                    {index + 1}
                  </div>
                );
              });
            })()}
          </div>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting || !hasAnsweredCurrent}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:shadow-none w-full sm:w-auto min-h-[48px] px-5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Flag className="h-4 w-4 mr-2" />
                  Submit Quiz
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              disabled={!hasAnsweredCurrent}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:shadow-none w-full sm:w-auto min-h-[48px] px-5"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
