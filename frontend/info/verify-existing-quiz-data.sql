-- Verify Existing Quiz Data Before Migration
-- This script analyzes your existing data to understand what will be migrated

-- =============================================
-- Step 1: Check existing quiz data
-- =============================================

-- Count total quizzes
SELECT 
    'Total Quizzes' as metric,
    COUNT(*) as count
FROM quizzes;

-- Count total user answers
SELECT 
    'Total User Answers' as metric,
    COUNT(*) as count
FROM user_answers
WHERE quiz_id IS NOT NULL;

-- Count unique user-quiz combinations
SELECT 
    'Unique User-Quiz Combinations' as metric,
    COUNT(DISTINCT (user_id, quiz_id)) as count
FROM user_answers
WHERE quiz_id IS NOT NULL;

-- =============================================
-- Step 2: Analyze quiz completion patterns
-- =============================================

-- Find quizzes where all questions are answered
WITH quiz_question_counts AS (
    SELECT 
        qq.quiz_id,
        COUNT(*) as total_questions
    FROM quiz_questions qq
    GROUP BY qq.quiz_id
),
user_answer_counts AS (
    SELECT 
        ua.user_id,
        ua.quiz_id,
        COUNT(*) as answered_questions,
        SUM(CASE WHEN ua.is_correct = true THEN 1 ELSE 0 END) as correct_answers,
        MAX(ua.created_at) as last_answer_time
    FROM user_answers ua
    WHERE ua.quiz_id IS NOT NULL
    GROUP BY ua.user_id, ua.quiz_id
),
completion_analysis AS (
    SELECT 
        uac.user_id,
        uac.quiz_id,
        qqc.total_questions,
        uac.answered_questions,
        uac.correct_answers,
        CASE 
            WHEN qqc.total_questions > 0 THEN 
                ROUND((uac.correct_answers::DECIMAL / qqc.total_questions) * 100)
            ELSE 0 
        END as score_percentage,
        uac.last_answer_time,
        CASE 
            WHEN uac.answered_questions >= qqc.total_questions THEN 'COMPLETED'
            WHEN uac.answered_questions > 0 THEN 'PARTIALLY_ANSWERED'
            ELSE 'NOT_STARTED'
        END as status
    FROM user_answer_counts uac
    JOIN quiz_question_counts qqc ON uac.quiz_id = qqc.quiz_id
)
SELECT 
    'Quiz Completion Analysis' as analysis,
    status,
    COUNT(*) as count,
    AVG(score_percentage) as avg_score,
    MIN(score_percentage) as min_score,
    MAX(score_percentage) as max_score
FROM completion_analysis
GROUP BY status
ORDER BY 
    CASE status 
        WHEN 'COMPLETED' THEN 1
        WHEN 'PARTIALLY_ANSWERED' THEN 2
        WHEN 'NOT_STARTED' THEN 3
    END;

-- =============================================
-- Step 3: Show sample of completed quizzes
-- =============================================

-- Show sample of quizzes that will be migrated
WITH quiz_question_counts AS (
    SELECT 
        qq.quiz_id,
        COUNT(*) as total_questions
    FROM quiz_questions qq
    GROUP BY qq.quiz_id
),
user_answer_counts AS (
    SELECT 
        ua.user_id,
        ua.quiz_id,
        COUNT(*) as answered_questions,
        SUM(CASE WHEN ua.is_correct = true THEN 1 ELSE 0 END) as correct_answers,
        MAX(ua.created_at) as last_answer_time
    FROM user_answers ua
    WHERE ua.quiz_id IS NOT NULL
    GROUP BY ua.user_id, ua.quiz_id
),
completed_quizzes AS (
    SELECT 
        uac.user_id,
        uac.quiz_id,
        qqc.total_questions,
        uac.answered_questions,
        uac.correct_answers,
        CASE 
            WHEN qqc.total_questions > 0 THEN 
                ROUND((uac.correct_answers::DECIMAL / qqc.total_questions) * 100)
            ELSE 0 
        END as score_percentage,
        uac.last_answer_time
    FROM user_answer_counts uac
    JOIN quiz_question_counts qqc ON uac.quiz_id = qqc.quiz_id
    WHERE uac.answered_questions >= qqc.total_questions
    AND qqc.total_questions > 0
)
SELECT 
    'Sample Completed Quizzes' as info,
    cq.user_id,
    cq.quiz_id,
    q.title as quiz_title,
    cq.total_questions,
    cq.answered_questions,
    cq.correct_answers,
    cq.score_percentage,
    cq.last_answer_time
FROM completed_quizzes cq
JOIN quizzes q ON cq.quiz_id = q.quiz_id
ORDER BY cq.last_answer_time DESC
LIMIT 10;

-- =============================================
-- Step 4: Check for potential issues
-- =============================================

-- Check for quizzes with no questions
SELECT 
    'Quizzes with No Questions' as issue,
    q.quiz_id,
    q.title
FROM quizzes q
LEFT JOIN quiz_questions qq ON q.quiz_id = qq.quiz_id
WHERE qq.quiz_id IS NULL;

-- Check for orphaned user answers
SELECT 
    'Orphaned User Answers' as issue,
    COUNT(*) as count
FROM user_answers ua
LEFT JOIN quizzes q ON ua.quiz_id = q.quiz_id
WHERE ua.quiz_id IS NOT NULL AND q.quiz_id IS NULL;

-- Check for duplicate answers (same user, quiz, question)
SELECT 
    'Potential Duplicate Answers' as issue,
    COUNT(*) as count
FROM (
    SELECT 
        user_id, 
        quiz_id, 
        question_id, 
        COUNT(*) as answer_count
    FROM user_answers
    WHERE quiz_id IS NOT NULL
    GROUP BY user_id, quiz_id, question_id
    HAVING COUNT(*) > 1
) duplicates;

-- =============================================
-- Verification Complete
-- =============================================

SELECT 'Data verification completed. Review the results above before running migration.' as status; 