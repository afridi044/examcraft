-- ExamCraft Database Schema
-- A comprehensive database schema for the ExamCraft exam preparation platform

-- Enable UUID extension (for PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- User Management
-- =============================================

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    institution VARCHAR(200),
    field_of_study VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- =============================================
-- Topics
-- =============================================

CREATE TABLE topics (
    topic_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_topic_id UUID REFERENCES topics(topic_id) ON DELETE SET NULL
);

CREATE INDEX idx_topics_parent ON topics(parent_topic_id);

-- =============================================
-- Questions
-- =============================================

CREATE TABLE questions (
    question_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('multiple-choice', 'true-false', 'fill-in-blank')),
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
    topic_id UUID REFERENCES topics(topic_id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_topic ON questions(topic_id);

CREATE TABLE question_options (
    option_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_question_options_question ON question_options(question_id);

-- =============================================
-- Quizzes
-- =============================================

CREATE TABLE quizzes (
    quiz_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    topic_id UUID REFERENCES topics(topic_id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quizzes_user ON quizzes(user_id);
CREATE INDEX idx_quizzes_topic ON quizzes(topic_id);

-- Many-to-many relationship between quizzes and questions
CREATE TABLE quiz_questions (
    quiz_id UUID NOT NULL REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    PRIMARY KEY (quiz_id, question_id)
);

CREATE INDEX idx_quiz_questions_question ON quiz_questions(question_id);

-- =============================================
-- Exams
-- =============================================

CREATE TABLE exams (
    exam_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    passing_score INTEGER,
    topic_id UUID REFERENCES topics(topic_id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exams_user ON exams(user_id);
CREATE INDEX idx_exams_topic ON exams(topic_id);

-- Many-to-many relationship between exams and questions
CREATE TABLE exam_questions (
    exam_id UUID NOT NULL REFERENCES exams(exam_id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    points INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (exam_id, question_id)
);

CREATE INDEX idx_exam_questions_question ON exam_questions(question_id);

-- =============================================
-- Exam Sessions
-- =============================================

CREATE TABLE exam_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(exam_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'timed_out')),
    total_score INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exam_sessions_user ON exam_sessions(user_id);
CREATE INDEX idx_exam_sessions_exam ON exam_sessions(exam_id);
CREATE INDEX idx_exam_sessions_status ON exam_sessions(status);

-- =============================================
-- User Answers
-- =============================================

CREATE TABLE user_answers (
    answer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
    session_id UUID REFERENCES exam_sessions(session_id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(quiz_id) ON DELETE SET NULL,
    selected_option_id UUID REFERENCES question_options(option_id) ON DELETE SET NULL,
    text_answer TEXT,
    is_correct BOOLEAN,
    time_taken_seconds INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_answers_user ON user_answers(user_id);
CREATE INDEX idx_user_answers_question ON user_answers(question_id);
CREATE INDEX idx_user_answers_session ON user_answers(session_id);
CREATE INDEX idx_user_answers_quiz ON user_answers(quiz_id);

-- =============================================
-- ards
CREATE TABLE flashcards (
    flashcard_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    topic_id UUID REFERENCES topics(topic_id) ON DELETE SET NULL,
    source_question_id UUID REFERENCES questions(question_id) ON DELETE SET NULL,
    next_review_date TIMESTAMP,
    interval_days INTEGER NOT NULL DEFAULT 1,
    ease_factor DECIMAL(4,2) NOT NULL DEFAULT 2.5,
    repetitions INTEGER NOT NULL DEFAULT 0,
    mastery_status VARCHAR(20) NOT NULL DEFAULT 'learning' CHECK (mastery_status IN ('learning', 'under_review', 'mastered')),
    consecutive_correct INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tags TEXT[]
);

CREATE INDEX idx_flashcards_user ON flashcards(user_id);
CREATE INDEX idx_flashcards_topic ON flashcards(topic_id);
CREATE INDEX idx_flashcards_review_date ON flashcards(next_review_date);
CREATE INDEX idx_flashcards_source_question ON flashcards(source_question_id);

-- =============================================
-- Explanations
-- =============================================

CREATE TABLE explanations (
    explanation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    ai_generated BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(question_id)
);

CREATE INDEX idx_explanations_question ON explanations(question_id);

-- =============================================
-- Educational Resources
-- =============================================

CREATE TABLE resources (
    resource_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(512) NOT NULL,
    resource_type VARCHAR(50) NOT NULL, -- article, video, pdf, etc.
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many relationship between questions and resources
CREATE TABLE question_resources (
    question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES resources(resource_id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, resource_id)
);

CREATE INDEX idx_question_resources_resource ON question_resources(resource_id);

-- =============================================
-- Analytics Tables
-- =============================================

-- Daily analytics aggregation
CREATE TABLE user_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    topic_id UUID REFERENCES topics(topic_id) ON DELETE SET NULL,
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    average_time_seconds DECIMAL(10,2),
    UNIQUE(user_id, date, topic_id)
);

CREATE INDEX idx_user_analytics_user ON user_analytics(user_id);
CREATE INDEX idx_user_analytics_date ON user_analytics(date);
CREATE INDEX idx_user_analytics_topic ON user_analytics(topic_id);

-- Exam-specific analytics
CREATE TABLE exam_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(exam_id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES exam_sessions(session_id) ON DELETE CASCADE,
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    score_percentage DECIMAL(5,2),
    time_spent_minutes DECIMAL(10,2),
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, session_id)
);

CREATE INDEX idx_exam_analytics_user ON exam_analytics(user_id);
CREATE INDEX idx_exam_analytics_exam ON exam_analytics(exam_id);

-- Topic progress tracking
CREATE TABLE user_topic_progress (
    progress_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,
    proficiency_level DECIMAL(4,2) NOT NULL DEFAULT 0, -- 0.0 to 1.0 scale
    questions_attempted INTEGER NOT NULL DEFAULT 0,
    questions_correct INTEGER NOT NULL DEFAULT 0,
    last_activity TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, topic_id)
);

CREATE INDEX idx_user_topic_progress_user ON user_topic_progress(user_id);
CREATE INDEX idx_user_topic_progress_topic ON user_topic_progress(topic_id);
