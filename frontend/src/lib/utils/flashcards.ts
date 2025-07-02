import type { FlashcardWithTopic } from "@/types";

export interface TopicStats {
  topicId: string;
  topicName: string;
  count: number;
  flashcards: FlashcardWithTopic[];
  progress: {
    learning: number;
    under_review: number;
    mastered: number;
    total: number;
  };
}

export interface FlashcardStats {
  topicStats: TopicStats[];
  selectedTopicFlashcards: FlashcardWithTopic[];
  selectedTopicName: string;
  overallProgress: {
    learning: number;
    under_review: number;
    mastered: number;
    total: number;
  };
}

// Calculate flashcard statistics
export function calculateFlashcardStats(
  flashcards: FlashcardWithTopic[] | undefined,
  selectedTopicId: string | null
): FlashcardStats {
  if (!flashcards) {
    return {
      topicStats: [],
      selectedTopicFlashcards: [],
      selectedTopicName: "",
      overallProgress: {
        learning: 0,
        under_review: 0,
        mastered: 0,
        total: 0,
      },
    };
  }

  // Group flashcards by topic and calculate overall progress in one pass
  const topicGroups = new Map<string, FlashcardWithTopic[]>();
  const overallProgress = {
    learning: 0,
    under_review: 0,
    mastered: 0,
    total: 0,
  };

  flashcards.forEach((flashcard) => {
    const topicId = flashcard.topic_id || "general";

    // Group by topic
    if (!topicGroups.has(topicId)) {
      topicGroups.set(topicId, []);
    }
    topicGroups.get(topicId)!.push(flashcard);

    // Calculate overall progress
    overallProgress.total++;
    switch (flashcard.mastery_status) {
      case "learning":
        overallProgress.learning++;
        break;
      case "under_review":
        overallProgress.under_review++;
        break;
      case "mastered":
        overallProgress.mastered++;
        break;
    }
  });

  // Create topic stats with progress breakdown
  const stats = Array.from(topicGroups.entries())
    .map(([topicId, cards]) => {
      // Calculate progress for this topic
      const progress = cards.reduce(
        (acc, card) => {
          acc.total++;
          switch (card.mastery_status) {
            case "learning":
              acc.learning++;
              break;
            case "under_review":
              acc.under_review++;
              break;
            case "mastered":
              acc.mastered++;
              break;
          }
          return acc;
        },
        { learning: 0, under_review: 0, mastered: 0, total: 0 }
      );

      return {
        topicId,
        topicName: cards[0]?.topic?.name || "General",
        count: cards.length,
        flashcards: cards,
        progress,
      };
    })
    .sort((a, b) => b.count - a.count); // Sort by count descending

  // Get selected topic's flashcards
  const selectedCards = selectedTopicId
    ? topicGroups.get(selectedTopicId) || []
    : [];
  const selectedName = selectedTopicId
    ? stats.find((s) => s.topicId === selectedTopicId)?.topicName || ""
    : "";

  return {
    topicStats: stats,
    selectedTopicFlashcards: selectedCards,
    selectedTopicName: selectedName,
    overallProgress,
  };
}

// CSS styles for 3D flashcard effects
export const FLASHCARD_3D_STYLES = `
  .perspective-1000 {
    perspective: 1000px;
  }
  .preserve-3d {
    transform-style: preserve-3d;
  }
  .backface-hidden {
    backface-visibility: hidden;
  }
`; 