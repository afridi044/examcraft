"use client";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useCurrentUser } from "@/hooks/useDatabase";
import { useUpdateProgress, useUserFlashcards } from "@/hooks/useBackendFlashcards";
import { flashcardService } from "@/lib/services/flashcard.service";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
// import { useScrollToTop } from "@/hooks/useScrollToTop";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trophy,
  Target,
  Brain,
  BookOpen,
  Zap,
  Star,
} from "lucide-react";
import type { FlashcardWithTopic } from "@/types";

interface StudySession {
  session_id: string;
  topic_id: string;
  topic_name: string;
  total_cards: number;
  mastery_status: "learning" | "under_review" | "mastered" | "all";
  cards: FlashcardWithTopic[];
}

type PerformanceType = "know" | "dont_know";

interface StudySessionPageProps {
  params: Promise<{ topicId: string }>;
}

interface SessionStats {
  totalSeen: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  cardsRemaining: number;
}

export default function StudySessionPage({ params }: StudySessionPageProps) {
  const router = useRouter();
  const { user, loading } = useBackendAuth();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const updateProgress = useUpdateProgress();
  
  // Flashcard data hook for cache invalidation
  const { refetch: refetchFlashcards } = useUserFlashcards(currentUser?.user_id || "");
  
  // useScrollToTop();

  // Core state
  const [topicId, setTopicId] = useState<string>("");
  const [session, setSession] = useState<StudySession | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Loading and error states
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Session stats
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalSeen: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    accuracy: 0,
    cardsRemaining: 0,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  // Invalidate flashcard cache when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      // Refetch flashcards when user leaves the study page
      if (currentUser?.user_id) {
        setTimeout(() => refetchFlashcards(), 100);
      }
    };
  }, [currentUser?.user_id, refetchFlashcards]);

  // Extract topic ID from params
  useEffect(() => {
    let mounted = true;
    
    const extractTopicId = async () => {
      try {
        const resolvedParams = await params;
        if (mounted) {
          setTopicId(resolvedParams.topicId);
        }
      } catch (error) {
        console.error('Failed to resolve params:', error);
        if (mounted) {
          setInitError('Failed to load page parameters');
          setIsInitializing(false);
        }
      }
    };

    extractTopicId();
    
    return () => {
      mounted = false;
    };
  }, [params]);

  // Initialize study session
  useEffect(() => {
    let mounted = true;
    
    const initializeStudySession = async () => {
      if (!currentUser?.user_id || !topicId || session) {
        return;
      }

      try {
        setIsInitializing(true);
        setInitError(null);
        
        console.log('🚀 Initializing study session:', { userId: currentUser.user_id, topicId });
        
        const response = await flashcardService.startStudySession({
          userId: currentUser.user_id,
          topicId,
          sessionType: 'mixed'
        });

        if (!mounted) return;

        if (response.success && response.data?.session) {
          const sessionData = response.data.session;
          console.log('✅ Session initialized:', sessionData);
          
          // Type-safe session data
          const typedSession: StudySession = {
            session_id: sessionData.session_id,
            topic_id: sessionData.topic_id,
            topic_name: sessionData.topic_name,
            total_cards: sessionData.total_cards,
            mastery_status: sessionData.mastery_status as StudySession['mastery_status'],
            cards: sessionData.cards || []
          };

          setSession(typedSession);
          setSessionStats(prev => ({
            ...prev,
            cardsRemaining: typedSession.cards.length,
          }));
          setIsInitializing(false);
        } else {
          throw new Error(response.error || 'Failed to create study session');
        }
      } catch (error) {
        console.error('💥 Session initialization failed:', error);
        if (mounted) {
          setInitError(error instanceof Error ? error.message : 'Failed to load study session');
          setIsInitializing(false);
        }
      }
    };

    if (currentUser?.user_id && topicId && !session) {
      initializeStudySession();
    }

    return () => {
      mounted = false;
    };
  }, [currentUser?.user_id, topicId, session]);

  // Handle performance feedback
  const handlePerformance = async (performance: PerformanceType) => {
    if (!session?.cards[currentCardIndex] || isUpdating) return;

    const currentCard = session.cards[currentCardIndex];
    const isLastCard = currentCardIndex >= session.cards.length - 1;

    setIsUpdating(true);

    try {
      // Update stats immediately for better UX
      setSessionStats(prev => {
        const newCorrect = performance === "know" ? prev.correctAnswers + 1 : prev.correctAnswers;
        const newIncorrect = performance === "dont_know" ? prev.incorrectAnswers + 1 : prev.incorrectAnswers;
        const newTotalSeen = prev.totalSeen + 1;
        const newAccuracy = newTotalSeen > 0 ? Math.round((newCorrect / newTotalSeen) * 100) : 0;
        const newRemaining = Math.max(0, session.cards.length - newTotalSeen);

        return {
          totalSeen: newTotalSeen,
          correctAnswers: newCorrect,
          incorrectAnswers: newIncorrect,
          accuracy: newAccuracy,
          cardsRemaining: newRemaining,
        };
      });

      // Move to next card
      if (!isLastCard) {
        setCurrentCardIndex(prev => prev + 1);
        setIsFlipped(false);
      }

      // Update progress in backend using correct performance values
      console.log('🎯 Updating flashcard progress:', {
        flashcardId: currentCard.flashcard_id,
        currentMasteryStatus: currentCard.mastery_status,
        performance: performance,
        quality: performance === "know" ? 4 : 1
      });
      
      await updateProgress.mutateAsync({
        flashcardId: currentCard.flashcard_id,
        quality: performance === "know" ? 4 : 1, // Keep quality for backward compatibility
        timeSpent: 30
      });

      // Navigate to completion if last card
      if (isLastCard) {
        // Invalidate flashcard cache before navigation
        refetchFlashcards();
        router.push(`/flashcards/study/${topicId}/complete`);
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
      // Don't show error to user since UI already updated optimistically
    } finally {
      setIsUpdating(false);
    }
  };

  // Restart session
  const handleRestart = async () => {
    if (!currentUser?.user_id || !topicId) return;

    try {
      setIsInitializing(true);
      setInitError(null);
      setSession(null);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setSessionStats({
        totalSeen: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        accuracy: 0,
        cardsRemaining: 0,
      });

      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await flashcardService.startStudySession({
        userId: currentUser.user_id,
        topicId,
        sessionType: 'mixed'
      });

      if (response.success && response.data?.session) {
        const sessionData = response.data.session;
        
        const typedSession: StudySession = {
          session_id: sessionData.session_id,
          topic_id: sessionData.topic_id,
          topic_name: sessionData.topic_name,
          total_cards: sessionData.total_cards,
          mastery_status: sessionData.mastery_status as StudySession['mastery_status'],
          cards: sessionData.cards || []
        };

        setSession(typedSession);
        setSessionStats(prev => ({
          ...prev,
          cardsRemaining: typedSession.cards.length,
        }));
      } else {
        throw new Error(response.error || 'Failed to restart session');
      }
    } catch (error) {
      console.error('Failed to restart session:', error);
      setInitError(error instanceof Error ? error.message : 'Failed to restart session');
    } finally {
      setIsInitializing(false);
    }
  };

  // Memoized current card and progress
  const { currentCard, progressPercentage } = useMemo(() => {
    if (!session?.cards?.length) {
      return { currentCard: null, progressPercentage: 0 };
    }

    const card = session.cards[currentCardIndex] || null;
    const progress = (sessionStats.totalSeen / session.cards.length) * 100;

    return { currentCard: card, progressPercentage: progress };
  }, [session?.cards, currentCardIndex, sessionStats.totalSeen]);

  // Loading states
  const isAuthLoading = loading || (user && userLoading) || (user && !currentUser);
  const showMainLoadingScreen = isAuthLoading || isInitializing;

  // Main loading screen
  if (showMainLoadingScreen) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/50">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-600/30 rounded-2xl blur-xl"></div>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              {isAuthLoading ? 'Authenticating...' : 'Loading Study Session...'}
            </h2>
            <p className="text-gray-400">
              {isAuthLoading ? 'Verifying your account' : 'Preparing your flashcards for study'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (initError) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900">
          <div className="text-center max-w-md mx-auto">
            <div className="h-16 w-16 bg-red-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Failed to Load Session
            </h2>
            <p className="text-slate-400 mb-8">
              {initError}
            </p>
            <div className="flex gap-4 justify-center">
              <motion.button
                onClick={() => {
                  refetchFlashcards();
                  router.push("/flashcards");
                }}
                className="px-6 py-3 bg-slate-700 rounded-xl text-white font-medium hover:bg-slate-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Flashcards
              </motion.button>
              <motion.button
                onClick={handleRestart}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // No session/cards available
  if (!session || !session.cards || session.cards.length === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
          <div className="text-center max-w-md mx-auto">
            <div className="h-16 w-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              No Flashcards Available
            </h2>
            <p className="text-slate-400 mb-8">
              This topic doesn&apos;t have any flashcards yet. Create some
              flashcards to start studying!
            </p>
            <motion.button
              onClick={() => {
                refetchFlashcards();
                router.push("/flashcards");
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Flashcards
            </motion.button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // No current card (shouldn't happen, but safety check)
  if (!currentCard) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
          <div className="text-center max-w-md mx-auto">
            <div className="h-16 w-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Loading Flashcard...
            </h2>
            <p className="text-slate-400 mb-8">
              Please wait while we prepare your next flashcard.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 p-4 sm:p-8 lg:p-20">
        {/* Header */}
        <div className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <motion.button
                  onClick={() => {
                    refetchFlashcards();
                    router.push("/flashcards");
                  }}
                  className="p-2 bg-slate-800/50 text-slate-300 rounded-xl border border-slate-700/50 hover:border-purple-400/50 hover:text-purple-400 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft size={20} />
                </motion.button>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-xl font-bold text-white flex items-center gap-2 truncate">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 flex-shrink-0" />
                    <span className="truncate">{session.topic_name}</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400">
                    {session.mastery_status === "learning" && "🎯 Learning Mode"}
                    {session.mastery_status === "under_review" && "📝 Review Mode"}
                    {session.mastery_status === "mastered" && "⭐ Mastered Mode"}
                    {session.mastery_status === "all" && "📚 All Cards"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <motion.button
                  onClick={handleRestart}
                  disabled={isInitializing}
                  className="p-2 bg-slate-800/50 text-slate-300 rounded-xl border border-slate-700/50 hover:border-orange-400/50 hover:text-orange-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Restart Session"
                >
                  <RotateCcw size={18} />
                </motion.button>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {currentCardIndex + 1} / {session.cards.length}
                  </p>
                  <p className="text-xs text-slate-400">Cards</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 sm:mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">
                  Progress: {sessionStats.totalSeen} / {session.cards.length} answered
                </span>
                <span className="text-xs text-slate-400">
                  {Math.round(progressPercentage)}% complete
                </span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-2 sm:h-3 relative overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-500">Card {currentCardIndex + 1}</span>
                <span className="text-xs text-slate-500">{session.cards.length} total</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4 sm:py-8">
          {/* Current Session Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 sm:p-4 text-center backdrop-blur-sm">
              <div className="flex items-center justify-center mb-2">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 mr-2" />
                <span className="text-lg sm:text-2xl font-bold text-white">
                  {sessionStats.totalSeen}
                </span>
              </div>
              <p className="text-xs text-slate-400">This Session</p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 sm:p-4 text-center backdrop-blur-sm">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 mr-2" />
                <span className="text-lg sm:text-2xl font-bold text-green-400">
                  {sessionStats.correctAnswers}
                </span>
              </div>
              <p className="text-xs text-slate-400">Known</p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 sm:p-4 text-center backdrop-blur-sm">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mr-2" />
                <span className="text-lg sm:text-2xl font-bold text-red-400">
                  {sessionStats.incorrectAnswers}
                </span>
              </div>
              <p className="text-xs text-slate-400">Learning</p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 sm:p-4 text-center backdrop-blur-sm">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 mr-2" />
                <span className="text-lg sm:text-2xl font-bold text-yellow-400">
                  {sessionStats.accuracy}%
                </span>
              </div>
              <p className="text-xs text-slate-400">Accuracy</p>
            </div>
          </div>

          {/* Main Flashcard */}
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="relative w-full h-80 sm:h-96 cursor-pointer mb-6 sm:mb-8"
              onClick={() => setIsFlipped(!isFlipped)}
              whileHover={{ scale: 1.02 }}
              style={{ perspective: "1000px" }}
            >
              <motion.div
                className="absolute w-full h-full"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Question Side */}
                <div
                  className="absolute w-full h-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50 rounded-2xl p-4 sm:p-8 flex flex-col justify-center items-center shadow-2xl backdrop-blur-sm"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="text-center w-full">
                    <div className="mb-4 sm:mb-6">
                      <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-full mb-3 sm:mb-4">
                        <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 uppercase tracking-wider font-medium">
                        Question
                      </p>
                    </div>
                    <h2 className="text-lg sm:text-2xl md:text-3xl text-white font-medium leading-relaxed mb-4 sm:mb-6 max-w-2xl mx-auto px-2">
                      {currentCard.question}
                    </h2>

                    {/* Mastery Status Indicator */}
                    <div className="mb-3 sm:mb-4">
                      {currentCard.mastery_status === "learning" && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 rounded-full text-xs sm:text-sm">
                          <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
                          Learning
                        </div>
                      )}
                      {currentCard.mastery_status === "under_review" && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-full text-xs sm:text-sm">
                          <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                          Under Review
                        </div>
                      )}
                      {currentCard.mastery_status === "mastered" && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-400/30 text-green-300 rounded-full text-xs sm:text-sm">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                          Mastered
                        </div>
                      )}
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-700/30 rounded-full">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span className="text-xs sm:text-sm text-slate-300">
                        Tap to reveal answer
                      </span>
                    </div>
                  </div>
                </div>

                {/* Answer Side */}
                <div
                  className="absolute w-full h-full bg-gradient-to-br from-purple-800/90 to-pink-800/90 border border-purple-600/50 rounded-2xl p-4 sm:p-8 flex flex-col justify-center items-center shadow-2xl backdrop-blur-sm"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="text-center w-full">
                    <div className="mb-4 sm:mb-6">
                      <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full mb-3 sm:mb-4">
                        <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <p className="text-xs sm:text-sm text-purple-100 uppercase tracking-wider font-medium">
                        Answer
                      </p>
                    </div>
                    <h2 className="text-lg sm:text-2xl md:text-3xl text-white font-medium leading-relaxed max-w-2xl mx-auto px-2">
                      {currentCard.answer}
                    </h2>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Action Buttons */}
            <AnimatePresence>
              {isFlipped && (
                <motion.div
                  className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 max-w-2xl mx-auto px-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.button
                    onClick={() => handlePerformance("dont_know")}
                    disabled={isUpdating}
                    className="flex-1 max-w-xs p-4 sm:p-6 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-400/30 text-red-300 rounded-2xl transition-all duration-200 hover:from-red-500/30 hover:to-red-600/30 hover:border-red-400/50 hover:scale-105 min-h-[80px] sm:min-h-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isUpdating ? 1 : 1.05 }}
                    whileTap={{ scale: isUpdating ? 1 : 0.95 }}
                  >
                    <div className="text-center">
                      <XCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-red-400" />
                      <span className="text-base sm:text-lg font-semibold block mb-1">
                        Don&apos;t Know
                      </span>
                      <p className="text-xs sm:text-sm opacity-80">
                        {currentCard.mastery_status === "learning" 
                          ? "Stay in learning" 
                          : "Back to learning"}
                      </p>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => handlePerformance("know")}
                    disabled={isUpdating}
                    className="flex-1 max-w-xs p-4 sm:p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 text-green-300 rounded-2xl transition-all duration-200 hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400/50 hover:scale-105 min-h-[80px] sm:min-h-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isUpdating ? 1 : 1.05 }}
                    whileTap={{ scale: isUpdating ? 1 : 0.95 }}
                  >
                    <div className="text-center">
                      <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-green-400" />
                      <span className="text-base sm:text-lg font-semibold block mb-1">
                        I Know This
                      </span>
                      <p className="text-xs sm:text-sm opacity-80">
                        {currentCard.mastery_status === "learning" 
                          ? "Move to review" 
                          : currentCard.mastery_status === "under_review"
                          ? "Move to mastered"
                          : "Stay mastered"}
                      </p>
                    </div>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Stats */}
            <div className="mt-8 sm:mt-12 text-center">
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 bg-slate-800/30 border border-slate-700/50 text-slate-300 rounded-full backdrop-blur-sm">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium">
                  {sessionStats.cardsRemaining} cards remaining
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
