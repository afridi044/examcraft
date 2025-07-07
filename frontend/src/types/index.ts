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
  status: "completed" | "incomplete" | "not_attempted" | "empty";
  total_questions: number;
  answered_questions?: number;
  correct_answers: number;
  score_percentage: number;
  time_spent_minutes: number;
  topic_name?: string;
  completion_status: string;
}

export interface QuizReviewData {
  quiz: {
    quiz_id: string;
    title: string;
    description?: string;
    topic?: {
      topic_id: string;
      name: string;
    };
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