-- Quiz Completions Migration Script
-- This script adds the quiz_completions table to track explicit quiz completions

-- =============================================
-- Quiz Completions Table
-- =============================================

CREATE TABLE IF NOT EXISTS quiz_completions (
    completion_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_questions INTEGER NOT NULL,
    answered_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    score_percentage INTEGER NOT NULL,
    time_spent_seconds INTEGER NOT NULL,
    was_auto_submitted BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE(user_id, quiz_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_completions_user ON quiz_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_completions_quiz ON quiz_completions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_completions_completed_at ON quiz_completions(completed_at);

-- =============================================
-- Migration Complete
-- =============================================

COMMENT ON TABLE quiz_completions IS 'Tracks explicit quiz completions by users';
COMMENT ON COLUMN quiz_completions.completed_at IS 'When the quiz was marked as completed';
COMMENT ON COLUMN quiz_completions.was_auto_submitted IS 'Whether the quiz was auto-submitted due to time expiration'; 