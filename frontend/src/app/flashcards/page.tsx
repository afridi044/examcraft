"use client";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import {
  Loader2,
  Plus,
  Play,
  BookOpen,
} from "lucide-react";
import { useEffect, Suspense, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { TopicCard } from "@/components/features/flashcards/TopicCard";
import { FlashCard } from "@/components/features/flashcards/FlashCard";
import { OverallProgress } from "@/components/features/flashcards/OverallProgress";
import { EmptyState } from "@/components/features/flashcards/EmptyState";
import { useFlashcardData } from "@/hooks/useFlashcardData";
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { CustomHeader } from "@/components/features/dashboard/CustomHeader";

function FlashcardsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser, loading: userLoading } = useBackendAuth();

  // Memoize userId to prevent unnecessary re-renders
  const userId = useMemo(() => currentUser?.id || "", [currentUser?.id]);

  // Scroll to top when navigating
  useScrollToTop();

  // Get topicId from URL
  const selectedTopicId = searchParams.get("topic");

  // Use custom hook for flashcard data management
  const {
    isLoadingFlashcards,
    stats,
  } = useFlashcardData(selectedTopicId);

  // Redirect to landing page if not authenticated and not loading
  useEffect(() => {
    if (!userLoading && !currentUser) {
      router.push("/");
    }
  }, [userLoading, currentUser, router]);

  const handleCreateFlashcard = (topicId?: string) => {
    if (topicId) {
      router.push(`/flashcards/create?topic_id=${topicId}`);
    } else {
      router.push("/flashcards/create");
    }
  };

  // When a topic is selected, update the URL
  const handleSelectTopic = (topicId: string) => {
    router.push(`/flashcards?topic=${topicId}`);
  };

  // When going back to topics list, remove topic from URL
  const handleBackToTopics = () => {
    router.push(`/flashcards`);
  };

  // Simplified loading logic
  const showFullLoadingScreen = userLoading || isLoadingFlashcards;

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
          <DashboardHeader
            title="Flashcards"
            subtitle="Organize and study your flashcards by topic"
            iconLeft={<BookOpen className="h-6 w-6 text-blue-400" />}
            rightContent={
              <motion.button
                onClick={() => handleCreateFlashcard()}
                className="hidden sm:flex px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg items-center gap-2 hover:opacity-90 transition-opacity text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={16} />
                <span>Create Flashcard</span>
              </motion.button>
            }
          />

          {/* Centered Create Flashcard button for mobile only */}
          <div className="flex justify-center my-4 sm:hidden">
            <motion.button
              onClick={() => handleCreateFlashcard()}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity text-sm"
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
                  onClick={() => handleSelectTopic(topic.topicId)}
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
        {/* Custom Header with Study Now Button */}
        <CustomHeader
          title="Your Flashcards"
          subtitle={`You have ${stats.selectedTopicFlashcards.length} flashcard${stats.selectedTopicFlashcards.length !== 1 ? "s" : ""} on ${stats.selectedTopicName}`}
          iconLeft={<BookOpen className="h-5 w-5 text-blue-400" />}
          buttonText="Study Now"
          buttonIcon={<Play size={16} />}
          onButtonClick={() => router.push(`/flashcards/study/${selectedTopicId}`)}
          buttonClassName="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center gap-2 sm:gap-3 hover:from-blue-800 hover:to-blue-900 transition-all text-sm sm:text-base font-semibold text-white shadow-lg whitespace-nowrap"
        />

        {/* Flashcards Grid */}
        {stats.selectedTopicFlashcards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 mt-4">
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
            onBack={handleBackToTopics}
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
