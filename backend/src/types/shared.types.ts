import type {
  Tables,
  TablesInsert,
  TablesUpdate,
  Database,
} from './supabase.generated';

// =============================================
// Base Types from Supabase (Re-exported for convenience)
// =============================================

// Core entity types
export type UserRow = Tables<'users'>;
export type TopicRow = Tables<'topics'>;
export type QuestionRow = Tables<'questions'>;
export type QuestionOptionRow = Tables<'question_options'>;
export type QuizRow = Tables<'quizzes'>;
export type QuizQuestionRow = Tables<'quiz_questions'>;
export type ExamRow = Tables<'exams'>;
export type ExamQuestionRow = Tables<'exam_questions'>;
export type ExamSessionRow = Tables<'exam_sessions'>;
export type UserAnswerRow = Tables<'user_answers'>;
export type FlashcardRow = Tables<'flashcards'>;
export type ExplanationRow = Tables<'explanations'>;
export type UserTopicProgressRow = Tables<'user_topic_progress'>;

// New entity types from updated schema
export type BookRow = Tables<'books'>;
export type ExamAnalyticsRow = Tables<'exam_analytics'>;
export type QuizCompletionRow = Tables<'quiz_completions'>;
export type ResourceRow = Tables<'resources'>;
export type StudyNoteRow = Tables<'study_notes'>;
export type TestRow = Tables<'test'>;
export type UserAnalyticsRow = Tables<'user_analytics'>;
export type QuestionResourceRow = Tables<'question_resources'>;

// Insert types
export type UserInsert = TablesInsert<'users'>;
export type TopicInsert = TablesInsert<'topics'>;
export type QuestionInsert = TablesInsert<'questions'>;
export type QuestionOptionInsert = TablesInsert<'question_options'>;
export type QuizInsert = TablesInsert<'quizzes'>;
export type QuizQuestionInsert = TablesInsert<'quiz_questions'>;
export type ExamInsert = TablesInsert<'exams'>;
export type ExamQuestionInsert = TablesInsert<'exam_questions'>;
export type ExamSessionInsert = TablesInsert<'exam_sessions'>;
export type UserAnswerInsert = TablesInsert<'user_answers'>;
export type FlashcardInsert = TablesInsert<'flashcards'>;
export type ExplanationInsert = TablesInsert<'explanations'>;
export type UserTopicProgressInsert = TablesInsert<'user_topic_progress'>;

// New insert types
export type BookInsert = TablesInsert<'books'>;
export type ExamAnalyticsInsert = TablesInsert<'exam_analytics'>;
export type QuizCompletionInsert = TablesInsert<'quiz_completions'>;
export type ResourceInsert = TablesInsert<'resources'>;
export type StudyNoteInsert = TablesInsert<'study_notes'>;
export type TestInsert = TablesInsert<'test'>;
export type UserAnalyticsInsert = TablesInsert<'user_analytics'>;
export type QuestionResourceInsert = TablesInsert<'question_resources'>;

// Update types
export type UserUpdate = TablesUpdate<'users'>;
export type TopicUpdate = TablesUpdate<'topics'>;
export type QuestionUpdate = TablesUpdate<'questions'>;
export type QuestionOptionUpdate = TablesUpdate<'question_options'>;
export type QuizUpdate = TablesUpdate<'quizzes'>;
export type QuizQuestionUpdate = TablesUpdate<'quiz_questions'>;
export type ExamUpdate = TablesUpdate<'exams'>;
export type ExamQuestionUpdate = TablesUpdate<'exam_questions'>;
export type ExamSessionUpdate = TablesUpdate<'exam_sessions'>;
export type UserAnswerUpdate = TablesUpdate<'user_answers'>;
export type FlashcardUpdate = TablesUpdate<'flashcards'>;
export type ExplanationUpdate = TablesUpdate<'explanations'>;
export type UserTopicProgressUpdate = TablesUpdate<'user_topic_progress'>;

// New update types
export type BookUpdate = TablesUpdate<'books'>;
export type ExamAnalyticsUpdate = TablesUpdate<'exam_analytics'>;
export type QuizCompletionUpdate = TablesUpdate<'quiz_completions'>;
export type ResourceUpdate = TablesUpdate<'resources'>;
export type StudyNoteUpdate = TablesUpdate<'study_notes'>;
export type TestUpdate = TablesUpdate<'test'>;
export type UserAnalyticsUpdate = TablesUpdate<'user_analytics'>;
export type QuestionResourceUpdate = TablesUpdate<'question_resources'>;

// =============================================
// Composite Types (Built from Supabase types)
// =============================================

export interface QuestionWithOptions extends QuestionRow {
  question_options: QuestionOptionRow[];
  topic?: TopicRow | null;
  explanation?: ExplanationRow;
  resources?: ResourceRow[];
}

export interface QuizWithQuestions extends QuizRow {
  questions: QuestionWithOptions[];
  quiz_questions?: QuizQuestionRow[];
  topic?: TopicRow;
  quiz_completion?: QuizCompletionRow;
}

export interface FlashcardWithTopic extends FlashcardRow {
  topic?: TopicRow;
  source_question?: QuestionWithOptions;
}

export interface ExamWithQuestions extends ExamRow {
  exam_questions: (ExamQuestionRow & {
    questions: QuestionWithOptions;
  })[];
  topic?: TopicRow;
  user: UserRow;
  exam_analytics?: ExamAnalyticsRow[];
}

export interface ExamSessionWithDetails extends ExamSessionRow {
  exams: ExamWithQuestions;
  user: UserRow;
  user_answers: UserAnswerRow[];
}

export interface UserAnswerWithDetails extends UserAnswerRow {
  questions: QuestionWithOptions;
  selected_option?: QuestionOptionRow;
  exam_sessions?: ExamSessionRow;
  quizzes?: QuizRow;
}

export interface TopicWithProgress extends TopicRow {
  user_topic_progress?: UserTopicProgressRow[];
  parent_topic?: TopicRow;
  child_topics?: TopicRow[];
  user_analytics?: UserAnalyticsRow[];
}

export interface BookWithDetails extends BookRow {
  // Add any additional relationships if needed
}

export interface StudyNoteWithTopic extends StudyNoteRow {
  topic?: TopicRow;
}

export interface ResourceWithDetails extends ResourceRow {
  question_resources?: QuestionResourceRow[];
}

// =============================================
// API Response Types
// =============================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

// =============================================
// Analytics Types
// =============================================

export interface DashboardStats {
  totalQuizzes: number;
  totalExams: number;
  totalFlashcards: number;
  averageScore: number;
  studyStreak: number;
  questionsAnswered: number;
  correctAnswers: number;
}

export interface RecentActivity {
  id: string;
  type: 'quiz' | 'exam' | 'flashcard' | 'book' | 'study_note';
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
// Table Names and Constants
// =============================================

export const TABLE_NAMES = {
  USERS: 'users',
  TOPICS: 'topics',
  QUESTIONS: 'questions',
  QUESTION_OPTIONS: 'question_options',
  QUIZZES: 'quizzes',
  QUIZ_QUESTIONS: 'quiz_questions',
  QUIZ_COMPLETIONS: 'quiz_completions',
  EXAMS: 'exams',
  EXAM_QUESTIONS: 'exam_questions',
  EXAM_SESSIONS: 'exam_sessions',
  EXAM_ANALYTICS: 'exam_analytics',
  USER_ANSWERS: 'user_answers',
  FLASHCARDS: 'flashcards',
  EXPLANATIONS: 'explanations',
  USER_TOPIC_PROGRESS: 'user_topic_progress',
  USER_ANALYTICS: 'user_analytics',
  BOOKS: 'books',
  RESOURCES: 'resources',
  QUESTION_RESOURCES: 'question_resources',
  STUDY_NOTES: 'study_notes',
  TEST: 'test',
} as const;

export type TableName = (typeof TABLE_NAMES)[keyof typeof TABLE_NAMES];

// =============================================
// Legacy Aliases (for backward compatibility during migration)
// =============================================

// Input types (legacy naming)
export type CreateUserInput = Omit<UserInsert, 'password_hash'> & { password_hash?: string };
export type CreateTopicInput = TopicInsert;
export type CreateQuestionInput = QuestionInsert;
export type CreateQuestionOptionInput = QuestionOptionInsert;
export type CreateQuizInput = QuizInsert;
export type CreateExamInput = ExamInsert;
export type CreateExamSessionInput = ExamSessionInsert;
export type CreateUserAnswerInput = UserAnswerInsert;
export type CreateFlashcardInput = FlashcardInsert;
export type CreateBookInput = BookInsert;
export type CreateResourceInput = ResourceInsert;
export type CreateStudyNoteInput = StudyNoteInsert;
export type CreateQuizCompletionInput = QuizCompletionInsert;
export type CreateUserAnalyticsInput = UserAnalyticsInsert;
export type CreateExamAnalyticsInput = ExamAnalyticsInsert;

// Update types (legacy naming)
export type UpdateUserInput = UserUpdate;
export type UpdateQuizInput = QuizUpdate;
export type UpdateFlashcardInput = FlashcardUpdate;
export type UpdateExamSessionInput = ExamSessionUpdate;
export type UpdateBookInput = BookUpdate;
export type UpdateResourceInput = ResourceUpdate;
export type UpdateStudyNoteInput = StudyNoteUpdate;
export type UpdateQuizCompletionInput = QuizCompletionUpdate;
export type UpdateUserAnalyticsInput = UserAnalyticsUpdate;
export type UpdateExamAnalyticsInput = ExamAnalyticsUpdate;

// =============================================
// Function Return Types (from Supabase functions)
// =============================================

export interface QuizCompletionData {
  completion_id: string;
  user_id: string;
  quiz_id: string;
  completed_at: string;
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  score_percentage: number;
  time_spent_minutes: number;
  was_auto_submitted: boolean;
}

export interface UserDashboardStats {
  total_quizzes: number;
  total_exams: number;
  total_flashcards: number;
  questions_answered: number;
  correct_answers: number;
  average_score: number;
  study_streak: number;
  total_study_time_minutes: number;
}

export interface UserQuizAttempt {
  quiz_id: string;
  title: string;
  topic_name: string;
  created_at: string;
  completed_at: string;
  status: string;
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  score_percentage: number;
  time_spent_minutes: number;
  completion_status: string;
}

export interface UserRecentActivity {
  activity_id: string;
  activity_type: string;
  title: string;
  score: number;
  completed_at: string;
  topic_name: string;
}

// Re-export Supabase types for direct usage
export type { Tables, TablesInsert, TablesUpdate, Database } from './supabase.generated'; 