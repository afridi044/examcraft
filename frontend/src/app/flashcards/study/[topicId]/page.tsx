"use client";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useCurrentUser } from "@/hooks/useDatabase";
import { useUpdateProgress, useUserFlashcards } from "@/hooks/useBackendFlashcards";
import { flashcardService } from "@/lib/services/flashcard.service";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
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
  Clock,
  TrendingUp,
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
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Brain className="h-6 w-6 text-white animate-pulse" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">
              {isAuthLoading ? 'Authenticating...' : 'Loading Study Session...'}
            </h2>
            <p className="text-sm text-gray-400">
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
        <div className="h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="h-12 w-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-6 w-6 text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">
              Failed to Load Session
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              {initError}
            </p>
            <div className="flex gap-3 justify-center">
              <motion.button
                onClick={() => {
                  refetchFlashcards();
                  router.push("/flashcards");
                }}
                className="px-4 py-2 bg-gray-700 rounded-lg text-white text-sm font-medium hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back to Flashcards
              </motion.button>
              <motion.button
                onClick={handleRestart}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
        <div className="h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="h-12 w-12 bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">
              No Flashcards Available
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              This topic doesn&apos;t have any flashcards yet. Create some
              flashcards to start studying!
            </p>
            <motion.button
              onClick={() => {
                refetchFlashcards();
                router.push("/flashcards");
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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
        <div className="h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="h-12 w-12 bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-gray-400 animate-pulse" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">
              Loading Flashcard...
            </h2>
            <p className="text-sm text-gray-400">
              Please wait while we prepare your next flashcard.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Premium Header - Edge-to-edge, no container */}
      <div className="pt-4 px-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* Topic Name and Mode */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-purple-400 flex-shrink-0" />
              <span className="text-2xl font-bold text-white truncate">{session.topic_name}</span>
            </div>
            <span className="text-xs text-gray-400 font-medium">
              {session.mastery_status === "learning" && "🎯 Learning Mode"}
              {session.mastery_status === "under_review" && "📝 Review Mode"}
              {session.mastery_status === "mastered" && "⭐ Mastered Mode"}
              {session.mastery_status === "all" && "📚 All Cards"}
            </span>
          </div>
          {/* Stat Chips */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-800 text-[11px] text-gray-200 font-medium min-h-0 h-6">
              <span className="text-white font-semibold">{currentCardIndex + 1} / {session.cards.length}</span> Cards
            </span>
          </div>
        </div>
        {/* Sleek Progress Bar */}
        
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mt-3">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 py-4 ">
        {/* Compact Stats Row */}
        <div className="grid grid-cols-4 gap-2 mb-4 mt-0">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-2 text-center min-w-0">
            <div className="flex items-center justify-center mb-0.5">
              <Brain className="h-3 w-3 text-blue-400 mr-0.5" />
              <span className="text-base font-bold text-white">{sessionStats.totalSeen}</span>
            </div>
            <p className="text-[10px] text-gray-400">Studied</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-2 text-center min-w-0">
            <div className="flex items-center justify-center mb-0.5">
              <CheckCircle className="h-3 w-3 text-green-400 mr-0.5" />
              <span className="text-base font-bold text-green-400">{sessionStats.correctAnswers}</span>
            </div>
            <p className="text-[10px] text-gray-400">Known</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-2 text-center min-w-0">
            <div className="flex items-center justify-center mb-0.5">
              <XCircle className="h-3 w-3 text-red-400 mr-0.5" />
              <span className="text-base font-bold text-red-400">{sessionStats.incorrectAnswers}</span>
            </div>
            <p className="text-[10px] text-gray-400">Learning</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-2 text-center min-w-0">
            <div className="flex items-center justify-center mb-0.5">
              <TrendingUp className="h-3 w-3 text-yellow-400 mr-0.5" />
              <span className="text-base font-bold text-yellow-400">{sessionStats.accuracy}%</span>
            </div>
            <p className="text-[10px] text-gray-400">Accuracy</p>
          </div>
        </div>

        {/* Compact Flashcard */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <motion.div
              className="relative w-full h-80 cursor-pointer mb-6"
              onClick={() => setIsFlipped(!isFlipped)}
              whileHover={{ scale: 1.01 }}
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
                  className="absolute w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 flex flex-col justify-center items-center shadow-xl"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="text-center w-full">
                    <div className="mb-4">
                      <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-full mb-3">
                        <BookOpen className="h-5 w-5 text-purple-400" />
                      </div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                        Question
                      </p>
                    </div>
                    <h2 className="text-xl text-white font-medium leading-relaxed mb-4 max-w-xl mx-auto">
                      {currentCard.question}
                    </h2>

                    {/* Mastery Status */}
                    <div className="mb-4">
                      {currentCard.mastery_status === "learning" && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 rounded-full text-xs">
                          <Brain className="h-3 w-3" />
                          Learning
                        </div>
                      )}
                      {currentCard.mastery_status === "under_review" && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-full text-xs">
                          <Target className="h-3 w-3" />
                          Under Review
                        </div>
                      )}
                      {currentCard.mastery_status === "mastered" && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-400/30 text-green-300 rounded-full text-xs">
                          <Star className="h-3 w-3" />
                          Mastered
                        </div>
                      )}
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-700/50 rounded-full">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-300">
                        Tap to reveal answer
                      </span>
                    </div>
                  </div>
                </div>

                {/* Answer Side */}
                <div
                  className="absolute w-full h-full bg-gradient-to-br from-purple-800 to-pink-800 border border-purple-600/50 rounded-xl p-6 flex flex-col justify-center items-center shadow-xl"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="text-center w-full">
                    <div className="mb-4">
                      <div className="inline-flex items-center justify-center w-10 h-10 bg-white/20 rounded-full mb-3">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-xs text-purple-100 uppercase tracking-wider font-medium">
                        Answer
                      </p>
                    </div>
                    <h2 className="text-xl text-white font-medium leading-relaxed max-w-xl mx-auto">
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
                  className="flex justify-center gap-4 max-w-lg mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.button
                    onClick={() => handlePerformance("dont_know")}
                    disabled={isUpdating}
                    className="flex-1 p-4 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-400/30 text-red-300 rounded-xl transition-all duration-200 hover:from-red-500/30 hover:to-red-600/30 hover:border-red-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isUpdating ? 1 : 1.02 }}
                    whileTap={{ scale: isUpdating ? 1 : 0.98 }}
                  >
                    <div className="text-center">
                      <XCircle className="h-6 w-6 mx-auto mb-2 text-red-400" />
                      <span className="text-sm font-semibold block mb-1">
                        Don&apos;t Know
                      </span>
                      <p className="text-xs opacity-80">
                        Need more practice
                      </p>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => handlePerformance("know")}
                    disabled={isUpdating}
                    className="flex-1 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 text-green-300 rounded-xl transition-all duration-200 hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isUpdating ? 1 : 1.02 }}
                    whileTap={{ scale: isUpdating ? 1 : 0.98 }}
                  >
                    <div className="text-center">
                      <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-400" />
                      <span className="text-sm font-semibold block mb-1">
                        I Know This
                      </span>
                      <p className="text-xs opacity-80">
                        Got it right
                      </p>
                    </div>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>


      </div>
    </DashboardLayout>
  );
}
