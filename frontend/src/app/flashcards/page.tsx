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
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Loading flashcards...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show topics view (default)
  if (!selectedTopicId) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
                Flashcards
              </h1>
              <p className="text-gray-400 text-sm">
                Organize and study your flashcards by topic
              </p>
            </div>
            <motion.button
              onClick={() => handleCreateFlashcard()}
              className="mt-3 sm:mt-0 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={16} />
              <span>Create Flashcard</span>
            </motion.button>
          </div>

          {/* Overall Progress */}
          <OverallProgress progress={stats.overallProgress} />

          {/* Topics Grid */}
          {stats.topicStats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
              <motion.button
                onClick={() => setSelectedTopicId(null)}
              className="p-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={16} />
              </motion.button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {stats.selectedTopicName}
              </h1>
              <p className="text-gray-400 text-sm">
                {stats.selectedTopicFlashcards.length} flashcard{stats.selectedTopicFlashcards.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3 sm:mt-0">
          <motion.button
              onClick={() => handleCreateFlashcard(selectedTopicId)}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={16} />
              <span>Add to Topic</span>
          </motion.button>
            <motion.button
              onClick={() => router.push(`/flashcards/study/${selectedTopicId}`)}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={16} />
              <span>Study Now</span>
            </motion.button>
          </div>
        </div>

        {/* Flashcards Grid */}
        {stats.selectedTopicFlashcards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
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
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Loading flashcards...</p>
            </div>
          </div>
        </DashboardLayout>
      }
    >
      <FlashcardsPageContent />
    </Suspense>
  );
}
