import type {
  Tables,
  TablesInsert,
  TablesUpdate,
  Database,
} from './supabase.generated';

// =============================================
// Base Types from Supabase (Re-exported for convenience)
// =============================================

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

// =============================================
// Composite Types (Built from Supabase types)
// =============================================

export interface QuestionWithOptions extends QuestionRow {
  question_options: QuestionOptionRow[];
  topic?: TopicRow | null;
  explanation?: ExplanationRow;
}

export interface QuizWithQuestions extends QuizRow {
  questions: QuestionWithOptions[];
  quiz_questions?: any[];
  topic?: TopicRow;
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
  user_topic_progress?: any[];
  parent_topic?: TopicRow;
  child_topics?: TopicRow[];
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
// Table Names and Constants
// =============================================

export const TABLE_NAMES = {
  USERS: 'users',
  TOPICS: 'topics',
  QUESTIONS: 'questions',
  QUESTION_OPTIONS: 'question_options',
  QUIZZES: 'quizzes',
  QUIZ_QUESTIONS: 'quiz_questions',
  EXAMS: 'exams',
  EXAM_QUESTIONS: 'exam_questions',
  EXAM_SESSIONS: 'exam_sessions',
  USER_ANSWERS: 'user_answers',
  FLASHCARDS: 'flashcards',
  EXPLANATIONS: 'explanations',
} as const;

export type TableName = (typeof TABLE_NAMES)[keyof typeof TABLE_NAMES];

// =============================================
// Legacy Aliases (for backward compatibility during migration)
// =============================================

// Row types
export type User = UserRow;
export type Topic = TopicRow;
export type Question = QuestionRow;
export type QuestionOption = QuestionOptionRow;
export type Quiz = QuizRow;
export type QuizQuestion = QuizQuestionRow;
export type Exam = ExamRow;
export type ExamQuestion = ExamQuestionRow;
export type ExamSession = ExamSessionRow;
export type UserAnswer = UserAnswerRow;
export type Flashcard = FlashcardRow;
export type Explanation = ExplanationRow;

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

// Update types (legacy naming)
export type UpdateUserInput = UserUpdate;
export type UpdateQuizInput = QuizUpdate;
export type UpdateFlashcardInput = FlashcardUpdate;
export type UpdateExamSessionInput = ExamSessionUpdate;

// Re-export Supabase types for direct usage
export type { Tables, TablesInsert, TablesUpdate, Database } from './supabase.generated'; 