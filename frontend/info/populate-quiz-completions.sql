-- Populate Quiz Completions from Existing Data
-- This script analyzes existing user_answers data and populates quiz_completions table

-- =============================================
-- Step 1: Create temporary function to calculate quiz completion data
-- =============================================

CREATE OR REPLACE FUNCTION calculate_quiz_completion_data()
RETURNS TABLE (
    user_id UUID,
    quiz_id UUID,
    total_questions BIGINT,
    answered_questions BIGINT,
    correct_answers BIGINT,
    score_percentage INTEGER,
    time_spent_seconds INTEGER,
    completed_at TIMESTAMP,
    was_auto_submitted BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH quiz_stats AS (
        -- Get quiz question counts
        SELECT 
            qq.quiz_id,
            COUNT(*) as total_questions
        FROM quiz_questions qq
        GROUP BY qq.quiz_id
    ),
    user_quiz_answers AS (
        -- Get user answers for quizzes with completion data
        SELECT 
            ua.user_id,
            ua.quiz_id,
            COUNT(*) as answered_questions,
            SUM(CASE WHEN ua.is_correct = true THEN 1 ELSE 0 END) as correct_answers,
            MAX(ua.created_at) as completed_at,
            -- Sum of all answer times (this is the actual time spent)
            COALESCE(SUM(ua.time_taken_seconds), 0) as total_time_seconds
        FROM user_answers ua
        WHERE ua.quiz_id IS NOT NULL
        GROUP BY ua.user_id, ua.quiz_id
    ),
    completed_quizzes AS (
        -- Find quizzes where all questions are answered
        SELECT 
            uqa.user_id,
            uqa.quiz_id,
            qs.total_questions,
            uqa.answered_questions,
            uqa.correct_answers,
            CASE 
                WHEN qs.total_questions > 0 THEN 
                    ROUND((uqa.correct_answers::DECIMAL / qs.total_questions) * 100)::INTEGER
                ELSE 0 
            END as score_percentage,
            uqa.total_time_seconds::INTEGER as time_spent_seconds,
            uqa.completed_at,
            false as was_auto_submitted -- We can't determine this from historical data
        FROM user_quiz_answers uqa
        JOIN quiz_stats qs ON uqa.quiz_id = qs.quiz_id
        WHERE uqa.answered_questions >= qs.total_questions
        AND qs.total_questions > 0
    )
    SELECT * FROM completed_quizzes;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Step 2: Populate quiz_completions table
-- =============================================

-- Insert data for all completed quizzes
INSERT INTO quiz_completions (
    user_id,
    quiz_id,
    total_questions,
    answered_questions,
    correct_answers,
    score_percentage,
    time_spent_seconds,
    completed_at,
    was_auto_submitted
)
SELECT 
    user_id,
    quiz_id,
    total_questions::INTEGER,
    answered_questions::INTEGER,
    correct_answers::INTEGER,
    score_percentage,
    time_spent_seconds,
    completed_at,
    was_auto_submitted
FROM calculate_quiz_completion_data()
ON CONFLICT (user_id, quiz_id) DO UPDATE SET
    total_questions = EXCLUDED.total_questions,
    answered_questions = EXCLUDED.answered_questions,
    correct_answers = EXCLUDED.correct_answers,
    score_percentage = EXCLUDED.score_percentage,
    time_spent_seconds = EXCLUDED.time_spent_seconds,
    completed_at = EXCLUDED.completed_at,
    was_auto_submitted = EXCLUDED.was_auto_submitted;

-- =============================================
-- Step 3: Show migration summary
-- =============================================

-- Display summary of migrated data
SELECT 
    'Migration Summary' as info,
    COUNT(*) as total_completed_quizzes,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT quiz_id) as unique_quizzes,
    AVG(score_percentage) as average_score,
    AVG(time_spent_seconds) as average_time_seconds
FROM quiz_completions;

-- Show sample of migrated data
SELECT 
    'Sample Migrated Data' as info,
    user_id,
    quiz_id,
    total_questions,
    answered_questions,
    correct_answers,
    score_percentage,
    time_spent_seconds,
    completed_at
FROM quiz_completions
ORDER BY completed_at DESC
LIMIT 10;

-- =============================================
-- Step 4: Cleanup
-- =============================================

-- Drop the temporary function
DROP FUNCTION IF EXISTS calculate_quiz_completion_data();

-- =============================================
-- Migration Complete
-- =============================================

SELECT 'Quiz completions migration completed successfully!' as status; 