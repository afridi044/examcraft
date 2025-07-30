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
  subtopics?: string[]; // Add subtopics for detailed view
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

  // Group flashcards by parent topic
  const parentTopicGroups = new Map<string, {
    parentTopic: any;
    flashcards: FlashcardWithTopic[];
    subtopics: Set<string>;
  }>();
  
  const overallProgress = {
    learning: 0,
    under_review: 0,
    mastered: 0,
    total: 0,
  };

  flashcards.forEach((flashcard) => {
    const topic = flashcard.topic;
    if (!topic) return;

    // Determine the parent topic ID
    // If topic has a parent, use parent; otherwise use the topic itself
    const parentTopicId = topic.parent_topic_id || topic.topic_id;
    
    // Initialize parent topic group if not exists
    if (!parentTopicGroups.has(parentTopicId)) {
      // Find the parent topic data
      let parentTopicData = topic;
      if (topic.parent_topic_id) {
        // This is a subtopic, we need to find the parent topic data
        // For now, we'll use the current topic's parent_topic_id and create a placeholder
        parentTopicData = {
          topic_id: parentTopicId,
          name: `Parent Topic`, // Will be updated when we find the actual parent
          parent_topic_id: null,
        };
        
        // Look for the actual parent topic in other flashcards
        const parentFlashcard = flashcards.find(f => f.topic?.topic_id === parentTopicId);
        if (parentFlashcard?.topic) {
          parentTopicData = parentFlashcard.topic;
        }
      }
      
      parentTopicGroups.set(parentTopicId, {
        parentTopic: parentTopicData,
        flashcards: [],
        subtopics: new Set(),
      });
    }

    // Add flashcard to parent topic group
    const group = parentTopicGroups.get(parentTopicId)!;
    group.flashcards.push(flashcard);
    
    // If this is a subtopic, add it to the subtopics set
    if (topic.parent_topic_id) {
      group.subtopics.add(topic.name);
    }

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

  // Create topic stats with progress breakdown for parent topics
  const stats = Array.from(parentTopicGroups.entries())
    .map(([parentTopicId, group]) => {
      // Calculate progress for this parent topic (including all subtopics)
      const progress = group.flashcards.reduce(
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

      // Create display name (just use parent topic name)
      const displayName = group.parentTopic.name;

      return {
        topicId: parentTopicId,
        topicName: displayName,
        count: group.flashcards.length,
        flashcards: group.flashcards,
        progress,
        subtopics: Array.from(group.subtopics), // Add subtopics array for detailed view
      };
    })
    .sort((a, b) => b.count - a.count); // Sort by count descending

  // Get selected topic's flashcards (could be parent topic or subtopic)
  let selectedCards: FlashcardWithTopic[] = [];
  let selectedName = "";
  
  if (selectedTopicId) {
    // Check if selectedTopicId is a parent topic
    const parentGroup = parentTopicGroups.get(selectedTopicId);
    if (parentGroup) {
      selectedCards = parentGroup.flashcards;
      selectedName = parentGroup.parentTopic.name;
    } else {
      // selectedTopicId might be a subtopic, find flashcards for that specific subtopic
      selectedCards = flashcards.filter(f => f.topic?.topic_id === selectedTopicId);
      selectedName = selectedCards[0]?.topic?.name || "";
    }
  }

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