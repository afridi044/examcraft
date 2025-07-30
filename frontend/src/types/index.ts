// Type Re-exports from Backend
// This file provides convenient access to backend shared types
// Import types like: import { User, Quiz } from "@/types"

// Re-export all types from backend shared types  
// export * from "@backend/types/shared.types";

// Additional frontend-specific type utilities can be added here if needed
export type { ComponentProps } from "react";

// =============================================
// Quiz-Specific Types (Frontend Extensions)
// =============================================

export interface QuizAttempt {
  quiz_id: string;
  title: string;
  created_at: string;
  completed_at?: string | null;
  status: "completed" | "not_taken";
  total_questions: number;
  answered_questions?: number;
  correct_answers: number;
  score_percentage: number;
  time_spent_seconds: number;
  topic_name?: string;
  completion_status: string;
  is_timed?: boolean;
  time_limit_minutes?: number;
}

export interface QuizReviewData {
  quiz: {
    quiz_id: string;
    title: string;
    description?: string;
    topic?: {
      topic_id: string;
      name: string;
      parent_topic_id?: string | null;
      parent_topic?: {
        topic_id: string;
        name: string;
      } | null;
    };
    is_timed?: boolean;
    time_limit_minutes?: number;
  };
  questions: Array<{
    question_id: string;
    content: string;
    question_type: string;
    difficulty?: number;
    flashcard_exists: boolean;
    question_options: Array<{
      option_id: string;
      content: string;
      is_correct: boolean;
    }>;
    explanation?: {
      content: string;
      ai_generated: boolean;
    };
    user_answer?: {
      selected_option_id?: string;
      text_answer?: string;
      is_correct: boolean;
      time_taken_seconds?: number;
    };
  }>;
  quiz_stats: {
    total_questions: number;
    correct_answers: number;
    percentage: number;
    total_time: number;
  };
}

// =============================================
// Dashboard-Specific Types
// =============================================

export interface RecentActivity {
  id: string;
  type: 'quiz' | 'exam' | 'flashcard';
  title: string;
  score?: number;
  completed_at: string;
  topic?: string;
}

export interface TopicProgress {
  topic_id: string;
  topic_name: string;
  progress_percentage: number;
  questions_attempted: number;
  questions_correct: number;
  last_activity: string;
}

// =============================================
// API Response Types
// =============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T | null;
  error?: string | null;
  message?: string;
}

// =============================================
// Library-Specific Types
// =============================================

export interface Quiz {
  quiz_id: string;
  title: string;
  description?: string;
  question_count: number;
  completion_rate: number;
  last_accessed: string;
  difficulty: string;
  topic?: {
    topic_id: string;
    name: string;
  };
}

export interface Flashcard {
  flashcard_id: string;
  title: string;
  card_count: number;
  mastered: number;
  next_review: string;
  topic: string;
  mastery_status: string;
}

export interface StudyNote {
  note_id: string;
  title: string;
  content: string;
  topic?: string;
  word_count: number;
  last_edited: string;
  created_at: string;
  updated_at?: string;
  topics?: {
    name: string;
  };
}

export interface FlashcardWithTopic {
  flashcard_id: string;
  user_id: string;
  question: string;
  answer: string;
  topic_id?: string;
  source_question_id?: string;
  mastery_status: 'learning' | 'under_review' | 'mastered';
  next_review?: string;
  created_at: string;
  updated_at: string;
  topic?: {
    topic_id: string;
    name: string;
    description?: string;
    parent_topic_id?: string;
  };
}


export interface Book {
  id: string;
  title: string;
  description: string;
  subject: string;
  pageCount: number;
  chapterCount: number;
  dateAdded: string;
  coverColor: string;
  isDigital: boolean;
  format: 'pdf' | 'epub' | 'textbook' | 'study-guide';
  url: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  category: 'template' | 'reference' | 'tool' | 'guide';
  fileType: 'pdf' | 'docx' | 'xlsx' | 'web' | 'link';
  fileSize: string;
  downloadUrl: string;
  previewUrl?: string;
  dateAdded: string;
  iconColor: string;
  tags: string[];
}