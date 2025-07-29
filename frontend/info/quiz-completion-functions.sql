-- Quiz Completion Database Functions
-- These functions handle quiz_completions table operations

-- =============================================
-- Function: Get quiz completions for a user
-- =============================================

CREATE OR REPLACE FUNCTION get_quiz_completions_for_user(p_user_id UUID)
RETURNS TABLE (
    completion_id UUID,
    user_id UUID,
    quiz_id UUID,
    completed_at TIMESTAMP,
    total_questions INTEGER,
    answered_questions INTEGER,
    correct_answers INTEGER,
    score_percentage INTEGER,
    time_spent_seconds INTEGER,
    was_auto_submitted BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qc.completion_id,
        qc.user_id,
        qc.quiz_id,
        qc.completed_at,
        qc.total_questions,
        qc.answered_questions,
        qc.correct_answers,
        qc.score_percentage,
        qc.time_spent_seconds,
        qc.was_auto_submitted
    FROM quiz_completions qc
    WHERE qc.user_id = p_user_id
    ORDER BY qc.completed_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Function: Get quiz completions for specific quizzes
-- =============================================

CREATE OR REPLACE FUNCTION get_quiz_completions_for_quizzes(p_user_id UUID, p_quiz_ids UUID[])
RETURNS TABLE (
    quiz_id UUID,
    completed_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qc.quiz_id,
        qc.completed_at
    FROM quiz_completions qc
    WHERE qc.user_id = p_user_id
    AND qc.quiz_id = ANY(p_quiz_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Function: Get single quiz completion
-- =============================================

CREATE OR REPLACE FUNCTION get_quiz_completion(p_user_id UUID, p_quiz_id UUID)
RETURNS TABLE (
    completed_at TIMESTAMP,
    score_percentage INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qc.completed_at,
        qc.score_percentage
    FROM quiz_completions qc
    WHERE qc.user_id = p_user_id
    AND qc.quiz_id = p_quiz_id
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Function: Record quiz completion
-- =============================================

CREATE OR REPLACE FUNCTION record_quiz_completion(
    p_user_id UUID,
    p_quiz_id UUID,
    p_total_questions INTEGER,
    p_answered_questions INTEGER,
    p_correct_answers INTEGER,
    p_score_percentage INTEGER,
    p_time_spent_seconds INTEGER,
    p_was_auto_submitted BOOLEAN
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    INSERT INTO quiz_completions (
        user_id,
        quiz_id,
        total_questions,
        answered_questions,
        correct_answers,
        score_percentage,
        time_spent_seconds,
        was_auto_submitted
    ) VALUES (
        p_user_id,
        p_quiz_id,
        p_total_questions,
        p_answered_questions,
        p_correct_answers,
        p_score_percentage,
        p_time_spent_seconds,
        p_was_auto_submitted
    )
    ON CONFLICT (user_id, quiz_id) DO UPDATE SET
        total_questions = EXCLUDED.total_questions,
        answered_questions = EXCLUDED.answered_questions,
        correct_answers = EXCLUDED.correct_answers,
        score_percentage = EXCLUDED.score_percentage,
        time_spent_seconds = EXCLUDED.time_spent_seconds,
        was_auto_submitted = EXCLUDED.was_auto_submitted,
        completed_at = CURRENT_TIMESTAMP
    RETURNING to_json(quiz_completions.*) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Functions Created Successfully
-- =============================================

SELECT 'Quiz completion functions created successfully!' as status; 