"use client";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import {
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
import { PageLoading } from "@/components/ui/loading";
import { useTheme } from "@/contexts/ThemeContext";

function FlashcardsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser, loading: userLoading, setSignOutMessage } = useBackendAuth();
  const { isDark } = useTheme();

  // Scroll to top when navigating
  useScrollToTop();

  // Get topicId from URL
  const selectedTopicId = searchParams.get("topic");

  // Use custom hook for flashcard data management
  const {
    isLoadingFlashcards,
    stats,
  } = useFlashcardData(selectedTopicId);

  // EARLY REDIRECT: Check authentication immediately before showing any content
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
        <PageLoading
          title="Loading Flashcards"
          subtitle="Preparing your study materials"
          variant="flashcard"
        />
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
            isDark={isDark}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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
          <PageLoading
            title="Loading Flashcards"
            subtitle="Preparing your study materials"
            variant="flashcard"
          />
        </DashboardLayout>
      }
    >
      <FlashcardsPageContent />
    </Suspense>
  );
}
