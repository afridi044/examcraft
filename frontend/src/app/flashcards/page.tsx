"use client";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useCurrentUser } from "@/hooks/useDatabase";
import {
  Loader2,
  Plus,
  ArrowLeft,
  Play,
} from "lucide-react";
import { useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { TopicCard } from "@/components/features/flashcards/TopicCard";
import { FlashCard } from "@/components/features/flashcards/FlashCard";
import { OverallProgress } from "@/components/features/flashcards/OverallProgress";
import { EmptyState } from "@/components/features/flashcards/EmptyState";
import { useFlashcardData } from "@/hooks/useFlashcardData";

function FlashcardsPageContent() {
  const router = useRouter();
  const { user, loading } = useBackendAuth();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();

  // Scroll to top when navigating
  useScrollToTop();
  
  // Use custom hook for flashcard data management
  const {
    isLoadingFlashcards,
    selectedTopicId,
    setSelectedTopicId,
    stats,
  } = useFlashcardData(currentUser?.user_id);

  // Redirect to landing page if not authenticated and not loading
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  const handleCreateFlashcard = (topicId?: string) => {
    if (topicId) {
      router.push(`/flashcards/create?topic_id=${topicId}`);
    } else {
      router.push("/flashcards/create");
    }
  };

  // Simplified loading logic
  const showFullLoadingScreen = loading || userLoading || isLoadingFlashcards;

  if (showFullLoadingScreen) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading flashcards...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show topics view (default)
  if (!selectedTopicId) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Flashcards
              </h1>
              <p className="text-gray-400">
                Organize and study your flashcards by topic
              </p>
            </div>
            <motion.button
              onClick={() => handleCreateFlashcard()}
              className="mt-4 sm:mt-0 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={20} />
              <span>Create Flashcard</span>
            </motion.button>
          </div>

          {/* Overall Progress */}
          <OverallProgress progress={stats.overallProgress} />

          {/* Topics Grid */}
          {stats.topicStats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {stats.topicStats.map((topic, index) => (
                <TopicCard
                  key={topic.topicId}
                  topicId={topic.topicId}
                  topicName={topic.topicName}
                  count={topic.count}
                  progress={topic.progress}
                  isSelected={false}
                  onClick={() => setSelectedTopicId(topic.topicId)}
                  onStudy={() => router.push(`/flashcards/study/${topic.topicId}`)}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No flashcards yet"
              description="Create your first flashcard to get started with studying"
              actionText="Create Flashcard"
              onAction={() => handleCreateFlashcard()}
            />
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Show flashcards for selected topic
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setSelectedTopicId(null)}
              className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={20} />
              </motion.button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {stats.selectedTopicName}
              </h1>
              <p className="text-gray-400">
                {stats.selectedTopicFlashcards.length} flashcard{stats.selectedTopicFlashcards.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
          <motion.button
              onClick={() => handleCreateFlashcard(selectedTopicId)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={20} />
              <span>Add to Topic</span>
          </motion.button>
            <motion.button
              onClick={() => router.push(`/flashcards/study/${selectedTopicId}`)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={20} />
              <span>Study Now</span>
            </motion.button>
          </div>
        </div>

        {/* Flashcards Grid */}
        {stats.selectedTopicFlashcards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {stats.selectedTopicFlashcards.map((flashcard, index) => (
              <FlashCard
                key={flashcard.flashcard_id}
                flashcard={flashcard}
                index={index}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No flashcards in this topic"
            description="Create flashcards for this topic to start studying"
            actionText="Create Flashcard"
            onAction={() => handleCreateFlashcard(selectedTopicId)}
            showBackButton
            onBack={() => setSelectedTopicId(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

export default function FlashcardsPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-400">Loading flashcards...</p>
            </div>
          </div>
        </DashboardLayout>
      }
    >
      <FlashcardsPageContent />
    </Suspense>
  );
}
