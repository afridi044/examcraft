export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      books: {
        Row: {
          book_id: string
          chapter_count: number
          cover_color: string
          created_at: string
          description: string | null
          format: string
          is_digital: boolean
          page_count: number
          subject: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          book_id?: string
          chapter_count?: number
          cover_color?: string
          created_at?: string
          description?: string | null
          format?: string
          is_digital?: boolean
          page_count?: number
          subject: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          book_id?: string
          chapter_count?: number
          cover_color?: string
          created_at?: string
          description?: string | null
          format?: string
          is_digital?: boolean
          page_count?: number
          subject?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      exam_analytics: {
        Row: {
          analytics_id: string
          completed_at: string
          correct_answers: number
          exam_id: string
          score_percentage: number | null
          session_id: string
          time_spent_minutes: number | null
          total_questions: number
          user_id: string
        }
        Insert: {
          analytics_id?: string
          completed_at?: string
          correct_answers?: number
          exam_id: string
          score_percentage?: number | null
          session_id: string
          time_spent_minutes?: number | null
          total_questions?: number
          user_id: string
        }
        Update: {
          analytics_id?: string
          completed_at?: string
          correct_answers?: number
          exam_id?: string
          score_percentage?: number | null
          session_id?: string
          time_spent_minutes?: number | null
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_analytics_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["exam_id"]
          },
          {
            foreignKeyName: "exam_analytics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "exam_sessions"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "exam_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          exam_id: string
          points: number
          question_id: string
          question_order: number
        }
        Insert: {
          exam_id: string
          points?: number
          question_id: string
          question_order: number
        }
        Update: {
          exam_id?: string
          points?: number
          question_id?: string
          question_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["exam_id"]
          },
          {
            foreignKeyName: "exam_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["question_id"]
          },
        ]
      }
      exam_sessions: {
        Row: {
          created_at: string
          end_time: string | null
          exam_id: string
          session_id: string
          start_time: string
          status: string
          total_score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          exam_id: string
          session_id?: string
          start_time?: string
          status?: string
          total_score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          exam_id?: string
          session_id?: string
          start_time?: string
          status?: string
          total_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_sessions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["exam_id"]
          },
          {
            foreignKeyName: "exam_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          exam_id: string
          passing_score: number | null
          title: string
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes: number
          exam_id?: string
          passing_score?: number | null
          title: string
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          exam_id?: string
          passing_score?: number | null
          title?: string
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "exams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      explanations: {
        Row: {
          ai_generated: boolean
          content: string
          created_at: string
          explanation_id: string
          question_id: string
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean
          content: string
          created_at?: string
          explanation_id?: string
          question_id: string
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean
          content?: string
          created_at?: string
          explanation_id?: string
          question_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "explanations_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: true
            referencedRelation: "questions"
            referencedColumns: ["question_id"]
          },
        ]
      }
      flashcards: {
        Row: {
          answer: string
          consecutive_correct: number
          created_at: string
          ease_factor: number
          flashcard_id: string
          interval_days: number
          mastery_status: string
          next_review_date: string | null
          question: string
          repetitions: number
          source_question_id: string | null
          tags: string[] | null
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answer: string
          consecutive_correct?: number
          created_at?: string
          ease_factor?: number
          flashcard_id?: string
          interval_days?: number
          mastery_status?: string
          next_review_date?: string | null
          question: string
          repetitions?: number
          source_question_id?: string | null
          tags?: string[] | null
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string
          consecutive_correct?: number
          created_at?: string
          ease_factor?: number
          flashcard_id?: string
          interval_days?: number
          mastery_status?: string
          next_review_date?: string | null
          question?: string
          repetitions?: number
          source_question_id?: string | null
          tags?: string[] | null
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_source_question_id_fkey"
            columns: ["source_question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "flashcards_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "flashcards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      question_options: {
        Row: {
          content: string
          is_correct: boolean
          option_id: string
          question_id: string
        }
        Insert: {
          content: string
          is_correct?: boolean
          option_id?: string
          question_id: string
        }
        Update: {
          content?: string
          is_correct?: boolean
          option_id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["question_id"]
          },
        ]
      }
      question_resources: {
        Row: {
          question_id: string
          resource_id: string
        }
        Insert: {
          question_id: string
          resource_id: string
        }
        Update: {
          question_id?: string
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_resources_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "question_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["resource_id"]
          },
        ]
      }
      questions: {
        Row: {
          content: string
          created_at: string
          difficulty: number | null
          question_id: string
          question_type: string
          topic_id: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          difficulty?: number | null
          question_id?: string
          question_type: string
          topic_id?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          difficulty?: number | null
          question_id?: string
          question_type?: string
          topic_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["topic_id"]
          },
        ]
      }
      quiz_completions: {
        Row: {
          answered_questions: number
          completed_at: string
          completion_id: string
          correct_answers: number
          quiz_id: string
          score_percentage: number
          time_spent_seconds: number
          total_questions: number
          user_id: string
          was_auto_submitted: boolean
        }
        Insert: {
          answered_questions: number
          completed_at?: string
          completion_id?: string
          correct_answers: number
          quiz_id: string
          score_percentage: number
          time_spent_seconds: number
          total_questions: number
          user_id: string
          was_auto_submitted?: boolean
        }
        Update: {
          answered_questions?: number
          completed_at?: string
          completion_id?: string
          correct_answers?: number
          quiz_id?: string
          score_percentage?: number
          time_spent_seconds?: number
          total_questions?: number
          user_id?: string
          was_auto_submitted?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "quiz_completions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["quiz_id"]
          },
          {
            foreignKeyName: "quiz_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          question_id: string
          question_order: number
          quiz_id: string
        }
        Insert: {
          question_id: string
          question_order: number
          quiz_id: string
        }
        Update: {
          question_id?: string
          question_order?: number
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["quiz_id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          description: string | null
          is_timed: boolean | null
          quiz_id: string
          time_per_question_seconds: number | null
          title: string
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          is_timed?: boolean | null
          quiz_id?: string
          time_per_question_seconds?: number | null
          title: string
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          is_timed?: boolean | null
          quiz_id?: string
          time_per_question_seconds?: number | null
          title?: string
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quizzes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string
          description: string | null
          resource_id: string
          resource_type: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          resource_id?: string
          resource_type: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          resource_id?: string
          resource_type?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      study_notes: {
        Row: {
          content: string
          created_at: string
          is_public: boolean | null
          note_id: string
          note_type: string
          tags: string[] | null
          title: string
          topic_id: string | null
          updated_at: string
          user_id: string
          word_count: number | null
        }
        Insert: {
          content: string
          created_at?: string
          is_public?: boolean | null
          note_id?: string
          note_type?: string
          tags?: string[] | null
          title: string
          topic_id?: string | null
          updated_at?: string
          user_id: string
          word_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          is_public?: boolean | null
          note_id?: string
          note_type?: string
          tags?: string[] | null
          title?: string
          topic_id?: string | null
          updated_at?: string
          user_id?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "study_notes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "study_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      test: {
        Row: {
          age: number | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number | null
        }
        Insert: {
          age?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
        }
        Update: {
          age?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
        }
        Relationships: []
      }
      topics: {
        Row: {
          description: string | null
          name: string
          parent_topic_id: string | null
          topic_id: string
        }
        Insert: {
          description?: string | null
          name: string
          parent_topic_id?: string | null
          topic_id?: string
        }
        Update: {
          description?: string | null
          name?: string
          parent_topic_id?: string | null
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_parent_topic_id_fkey"
            columns: ["parent_topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["topic_id"]
          },
        ]
      }
      user_analytics: {
        Row: {
          analytics_id: string
          average_time_seconds: number | null
          correct_answers: number
          date: string
          topic_id: string | null
          total_questions: number
          user_id: string
        }
        Insert: {
          analytics_id?: string
          average_time_seconds?: number | null
          correct_answers?: number
          date?: string
          topic_id?: string | null
          total_questions?: number
          user_id: string
        }
        Update: {
          analytics_id?: string
          average_time_seconds?: number | null
          correct_answers?: number
          date?: string
          topic_id?: string | null
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_answers: {
        Row: {
          answer_id: string
          created_at: string
          is_correct: boolean | null
          question_id: string
          quiz_id: string | null
          selected_option_id: string | null
          session_id: string | null
          text_answer: string | null
          time_taken_seconds: number | null
          user_id: string
        }
        Insert: {
          answer_id?: string
          created_at?: string
          is_correct?: boolean | null
          question_id: string
          quiz_id?: string | null
          selected_option_id?: string | null
          session_id?: string | null
          text_answer?: string | null
          time_taken_seconds?: number | null
          user_id: string
        }
        Update: {
          answer_id?: string
          created_at?: string
          is_correct?: boolean | null
          question_id?: string
          quiz_id?: string | null
          selected_option_id?: string | null
          session_id?: string | null
          text_answer?: string | null
          time_taken_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "user_answers_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["quiz_id"]
          },
          {
            foreignKeyName: "user_answers_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["option_id"]
          },
          {
            foreignKeyName: "user_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "exam_sessions"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "user_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_topic_progress: {
        Row: {
          last_activity: string
          proficiency_level: number
          progress_id: string
          questions_attempted: number
          questions_correct: number
          topic_id: string
          user_id: string
        }
        Insert: {
          last_activity?: string
          proficiency_level?: number
          progress_id?: string
          questions_attempted?: number
          questions_correct?: number
          topic_id: string
          user_id: string
        }
        Update: {
          last_activity?: string
          proficiency_level?: number
          progress_id?: string
          questions_attempted?: number
          questions_correct?: number
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_topic_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "user_topic_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          field_of_study: string | null
          first_name: string
          institution: string | null
          last_login: string | null
          last_name: string
          supabase_auth_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          field_of_study?: string | null
          first_name: string
          institution?: string | null
          last_login?: string | null
          last_name: string
          supabase_auth_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          email?: string
          field_of_study?: string | null
          first_name?: string
          institution?: string | null
          last_login?: string | null
          last_name?: string
          supabase_auth_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_sample_data_for_user: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      get_quiz_completion: {
        Args: { p_user_id: string; p_quiz_id: string }
        Returns: {
          completed_at: string
          score_percentage: number
        }[]
      }
      get_quiz_completions_for_quizzes: {
        Args: { p_user_id: string; p_quiz_ids: string[] }
        Returns: {
          quiz_id: string
          completed_at: string
        }[]
      }
      get_quiz_completions_for_user: {
        Args: { p_user_id: string }
        Returns: {
          completion_id: string
          user_id: string
          quiz_id: string
          completed_at: string
          total_questions: number
          answered_questions: number
          correct_answers: number
          score_percentage: number
          time_spent_minutes: number
          was_auto_submitted: boolean
        }[]
      }
      get_user_by_auth_id: {
        Args: { auth_id: string }
        Returns: {
          user_id: string
          email: string
          first_name: string
          last_name: string
          institution: string
          field_of_study: string
          created_at: string
          updated_at: string
          last_login: string
        }[]
      }
      get_user_dashboard_stats: {
        Args: { p_user_id: string }
        Returns: {
          total_quizzes: number
          total_exams: number
          total_flashcards: number
          questions_answered: number
          correct_answers: number
          average_score: number
          study_streak: number
          total_study_time_minutes: number
        }[]
      }
      get_user_quiz_attempts: {
        Args: { p_user_id: string }
        Returns: {
          quiz_id: string
          title: string
          topic_name: string
          created_at: string
          completed_at: string
          status: string
          total_questions: number
          answered_questions: number
          correct_answers: number
          score_percentage: number
          time_spent_minutes: number
          completion_status: string
        }[]
      }
      get_user_recent_activity: {
        Args: { p_user_id: string; p_limit?: number }
        Returns: {
          activity_id: string
          activity_type: string
          title: string
          score: number
          completed_at: string
          topic_name: string
        }[]
      }
      get_user_topic_progress: {
        Args: { p_user_id: string }
        Returns: {
          topic_id: string
          topic_name: string
          progress_percentage: number
          questions_attempted: number
          questions_correct: number
          last_activity: string
        }[]
      }
      record_quiz_completion: {
        Args: {
          p_user_id: string
          p_quiz_id: string
          p_total_questions: number
          p_answered_questions: number
          p_correct_answers: number
          p_score_percentage: number
          p_time_spent_minutes: number
          p_was_auto_submitted: boolean
        }
        Returns: Json
      }
      update_user_profile: {
        Args: {
          auth_id: string
          new_first_name?: string
          new_last_name?: string
          new_institution?: string
          new_field_of_study?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
