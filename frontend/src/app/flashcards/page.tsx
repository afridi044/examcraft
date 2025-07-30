"use client";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import {
  Plus,
  Play,
  BookOpen,
  Filter,
  ChevronDown,
} from "lucide-react";
import { useEffect, Suspense, useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FlashcardWithTopic } from "@/types";

function FlashcardsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser, loading: userLoading, setSignOutMessage } = useBackendAuth();

  // Scroll to top when navigating
  useScrollToTop();

  // Get topicId from URL
  const selectedTopicId = searchParams.get("topic");
  const [subtopicFilter, setSubtopicFilter] = useState<string>("all");

  // Use custom hook for flashcard data management
  const { 
    isLoadingFlashcards,
    stats,
  } = useFlashcardData(selectedTopicId);

  // Reset filter when topic changes
  useEffect(() => {
    setSubtopicFilter("all");
  }, [selectedTopicId]);

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

        {/* Check if this is a parent topic with subtopics */}
        {(() => {
          const parentTopicData = stats.topicStats.find(t => t.topicId === selectedTopicId);
          const hasSubtopics = parentTopicData && parentTopicData.subtopics && parentTopicData.subtopics.length > 0;
          
          if (hasSubtopics) {
            // Group flashcards by subtopic for display
            const subtopicGroups = new Map<string, FlashcardWithTopic[]>();
            const standaloneFlashcards: FlashcardWithTopic[] = [];
            
            stats.selectedTopicFlashcards.forEach(flashcard => {
              const topicName = flashcard.topic?.name;
              if (topicName && parentTopicData.subtopics!.includes(topicName)) {
                if (!subtopicGroups.has(topicName)) {
                  subtopicGroups.set(topicName, []);
                }
                subtopicGroups.get(topicName)!.push(flashcard);
              } else {
                standaloneFlashcards.push(flashcard);
              }
            });

            // Apply filter
            const filteredSubtopicGroups = subtopicFilter === "all" 
              ? subtopicGroups 
              : new Map([[subtopicFilter, subtopicGroups.get(subtopicFilter) || []]]);
            
            const showStandaloneFlashcards = subtopicFilter === "all" || subtopicFilter === stats.selectedTopicName;

            return (
              <div className="space-y-6 sm:space-y-8 mt-4">
                {/* Filter Section */}
                <div className="flex items-center justify-start">
                  <Select value={subtopicFilter} onValueChange={setSubtopicFilter}>
                    <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-gray-200">
                      <SelectValue placeholder="All subtopics" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all" className="text-gray-200 focus:bg-slate-700">
                        All subtopics
                      </SelectItem>
                      <SelectItem value={stats.selectedTopicName} className="text-gray-200 focus:bg-slate-700">
                        {stats.selectedTopicName} only
                      </SelectItem>
                      {Array.from(subtopicGroups.keys()).map((subtopicName) => (
                        <SelectItem key={subtopicName} value={subtopicName} className="text-gray-200 focus:bg-slate-700">
                          {subtopicName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Standalone flashcards under parent topic (shown first) */}
                {showStandaloneFlashcards && standaloneFlashcards.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0 }}
                  >
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-100">
                          {stats.selectedTopicName} ({standaloneFlashcards.length} flashcard{standaloneFlashcards.length !== 1 ? "s" : ""})
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-400">Direct flashcards for this topic</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                      {standaloneFlashcards.map((flashcard, index) => (
                        <FlashCard
                          key={flashcard.flashcard_id}
                          flashcard={flashcard}
                          index={index}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Subtopic Sections (shown after direct topic flashcards) */}
                {Array.from(filteredSubtopicGroups.entries()).map(([subtopicName, flashcards], sectionIndex) => (
                  flashcards && flashcards.length > 0 && (
                    <motion.div
                      key={subtopicName}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: (showStandaloneFlashcards && standaloneFlashcards.length > 0 ? 1 : 0) + sectionIndex * 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-lg sm:text-xl font-semibold text-gray-100">
                            {subtopicName} ({flashcards.length} flashcard{flashcards.length !== 1 ? "s" : ""})
                          </h2>
                          <p className="text-xs sm:text-sm text-gray-400">Study flashcards for this subtopic</p>
                        </div>
                        <motion.button
                          onClick={() => {
                            // Find the subtopic ID and navigate to it
                            const subtopicId = flashcards[0]?.topic?.topic_id;
                            if (subtopicId) {
                              router.push(`/flashcards/study/${subtopicId}`);
                            }
                          }}
                          className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 text-purple-300 rounded-lg hover:from-purple-500/30 hover:to-blue-500/30 hover:border-purple-400/50 transition-all text-sm font-medium flex items-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Play className="h-4 w-4" />
                          Study
                        </motion.button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                        {flashcards.map((flashcard, index) => (
                          <FlashCard
                            key={flashcard.flashcard_id}
                            flashcard={flashcard}
                            index={index}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )
                ))}

                {/* No results for filter */}
                {subtopicFilter !== "all" && 
                 !showStandaloneFlashcards && 
                 (filteredSubtopicGroups.size === 0 || Array.from(filteredSubtopicGroups.values()).every(cards => !cards || cards.length === 0)) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-12"
                  >
                    <div className="p-4 bg-slate-800/50 rounded-lg inline-block mb-4">
                      <Filter className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">No flashcards found</h3>
                    <p className="text-gray-400 mb-4">No flashcards match the selected filter.</p>
                    <Button 
                      onClick={() => setSubtopicFilter("all")}
                      variant="outline"
                      className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 text-gray-300 hover:text-white"
                    >
                      Show All
                    </Button>
                  </motion.div>
                )}
              </div>
            );
          } else {
            // Regular single topic view (no subtopics)
            return stats.selectedTopicFlashcards.length > 0 ? (
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
            );
          }
        })()}
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
