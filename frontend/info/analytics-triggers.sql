-- Analytics Auto-Population Triggers
-- This script creates triggers to automatically update analytics tables when users perform activities

-- =============================================
-- TRIGGER FUNCTION: Update user_analytics after user_answers changes
-- =============================================
CREATE OR REPLACE FUNCTION update_user_analytics_from_answers()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    target_date DATE;
    target_topic_id UUID;
BEGIN
    -- Determine the user_id, date, and topic_id to update
    IF TG_OP = 'DELETE' THEN
        target_user_id := OLD.user_id;
        target_date := DATE(OLD.created_at);
        SELECT topic_id INTO target_topic_id FROM questions WHERE question_id = OLD.question_id;
    ELSE
        target_user_id := NEW.user_id;
        target_date := DATE(NEW.created_at);
        SELECT topic_id INTO target_topic_id FROM questions WHERE question_id = NEW.question_id;
    END IF;

    -- Skip if no topic_id found
    IF target_topic_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Recalculate analytics for this user/date/topic combination
    INSERT INTO user_analytics (user_id, date, topic_id, total_questions, correct_answers, average_time_seconds)
    SELECT 
        ua.user_id,
        DATE(ua.created_at) as date,
        q.topic_id,
        COUNT(*) as total_questions,
        SUM(CASE WHEN ua.is_correct = true THEN 1 ELSE 0 END) as correct_answers,
        AVG(ua.time_taken_seconds) as average_time_seconds
    FROM user_answers ua
    JOIN questions q ON ua.question_id = q.question_id
    WHERE ua.user_id = target_user_id 
        AND DATE(ua.created_at) = target_date
        AND q.topic_id = target_topic_id
    GROUP BY ua.user_id, DATE(ua.created_at), q.topic_id
    ON CONFLICT (user_id, date, topic_id) DO UPDATE SET
        total_questions = EXCLUDED.total_questions,
        correct_answers = EXCLUDED.correct_answers,
        average_time_seconds = EXCLUDED.average_time_seconds;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGER FUNCTION: Update user_topic_progress after user_answers changes
-- =============================================
CREATE OR REPLACE FUNCTION update_user_topic_progress_from_answers()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    target_topic_id UUID;
BEGIN
    -- Determine the user_id and topic_id to update
    IF TG_OP = 'DELETE' THEN
        target_user_id := OLD.user_id;
        SELECT topic_id INTO target_topic_id FROM questions WHERE question_id = OLD.question_id;
    ELSE
        target_user_id := NEW.user_id;
        SELECT topic_id INTO target_topic_id FROM questions WHERE question_id = NEW.question_id;
    END IF;

    -- Skip if no topic_id found
    IF target_topic_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Recalculate topic progress for this user/topic combination
    INSERT INTO user_topic_progress (user_id, topic_id, proficiency_level, questions_attempted, questions_correct, last_activity)
    SELECT 
        ua.user_id,
        q.topic_id,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                CAST(SUM(CASE WHEN ua.is_correct = true THEN 1 ELSE 0 END) AS DECIMAL) / COUNT(*)
            ELSE 0 
        END as proficiency_level,
        COUNT(*) as questions_attempted,
        SUM(CASE WHEN ua.is_correct = true THEN 1 ELSE 0 END) as questions_correct,
        MAX(ua.created_at) as last_activity
    FROM user_answers ua
    JOIN questions q ON ua.question_id = q.question_id
    WHERE ua.user_id = target_user_id 
        AND q.topic_id = target_topic_id
    GROUP BY ua.user_id, q.topic_id
    ON CONFLICT (user_id, topic_id) DO UPDATE SET
        proficiency_level = EXCLUDED.proficiency_level,
        questions_attempted = EXCLUDED.questions_attempted,
        questions_correct = EXCLUDED.questions_correct,
        last_activity = EXCLUDED.last_activity;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGER FUNCTION: Update analytics after flashcard changes
-- =============================================
CREATE OR REPLACE FUNCTION update_user_analytics_from_flashcards()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    target_date DATE;
    target_topic_id UUID;
    activity_occurred BOOLEAN := false;
BEGIN
    -- Determine if this is a meaningful flashcard activity (not just creation)
    IF TG_OP = 'INSERT' THEN
        -- Only count as activity if it's not a newly created card
        IF NEW.updated_at != NEW.created_at THEN
            activity_occurred := true;
        END IF;
        target_user_id := NEW.user_id;
        target_date := DATE(NEW.updated_at);
        target_topic_id := NEW.topic_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Count as activity if updated_at changed or mastery status changed
        IF NEW.updated_at != OLD.updated_at OR NEW.mastery_status != OLD.mastery_status THEN
            activity_occurred := true;
        END IF;
        target_user_id := NEW.user_id;
        target_date := DATE(NEW.updated_at);
        target_topic_id := NEW.topic_id;
    ELSIF TG_OP = 'DELETE' THEN
        activity_occurred := true;
        target_user_id := OLD.user_id;
        target_date := DATE(OLD.updated_at);
        target_topic_id := OLD.topic_id;
    END IF;

    -- Skip if no meaningful activity or no topic_id
    IF NOT activity_occurred OR target_topic_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Update user_analytics with flashcard activity
    INSERT INTO user_analytics (user_id, date, topic_id, total_questions, correct_answers, average_time_seconds)
    SELECT 
        f.user_id,
        DATE(f.updated_at) as date,
        f.topic_id,
        COUNT(*) as total_questions,
        SUM(CASE WHEN f.mastery_status = 'mastered' THEN 1 ELSE 0 END) as correct_answers,
        30 as average_time_seconds -- Estimate 30 seconds per flashcard review
    FROM flashcards f
    WHERE f.user_id = target_user_id 
        AND DATE(f.updated_at) = target_date
        AND f.topic_id = target_topic_id
        AND f.updated_at != f.created_at -- Only actual study sessions
    GROUP BY f.user_id, DATE(f.updated_at), f.topic_id
    HAVING COUNT(*) > 0
    ON CONFLICT (user_id, date, topic_id) DO UPDATE SET
        total_questions = user_analytics.total_questions + EXCLUDED.total_questions - COALESCE((
            SELECT COUNT(*) FROM flashcards 
            WHERE user_id = target_user_id 
                AND DATE(updated_at) = target_date 
                AND topic_id = target_topic_id
                AND updated_at != created_at
        ), 0),
        correct_answers = user_analytics.correct_answers + EXCLUDED.correct_answers - COALESCE((
            SELECT SUM(CASE WHEN mastery_status = 'mastered' THEN 1 ELSE 0 END) FROM flashcards 
            WHERE user_id = target_user_id 
                AND DATE(updated_at) = target_date 
                AND topic_id = target_topic_id
                AND updated_at != created_at
        ), 0),
        average_time_seconds = (user_analytics.average_time_seconds * user_analytics.total_questions + EXCLUDED.average_time_seconds * EXCLUDED.total_questions) / GREATEST(user_analytics.total_questions + EXCLUDED.total_questions, 1);

    -- Update user_topic_progress for flashcards
    INSERT INTO user_topic_progress (user_id, topic_id, proficiency_level, questions_attempted, questions_correct, last_activity)
    SELECT 
        f.user_id,
        f.topic_id,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                CAST(SUM(CASE WHEN f.mastery_status = 'mastered' THEN 1 ELSE 0 END) AS DECIMAL) / COUNT(*)
            ELSE 0 
        END as proficiency_level,
        COUNT(*) as questions_attempted,
        SUM(CASE WHEN f.mastery_status = 'mastered' THEN 1 ELSE 0 END) as questions_correct,
        MAX(f.updated_at) as last_activity
    FROM flashcards f
    WHERE f.user_id = target_user_id 
        AND f.topic_id = target_topic_id
    GROUP BY f.user_id, f.topic_id
    HAVING COUNT(*) > 0
    ON CONFLICT (user_id, topic_id) DO UPDATE SET
        proficiency_level = (
            COALESCE((
                SELECT SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)
                FROM user_answers ua 
                JOIN questions q ON ua.question_id = q.question_id
                WHERE ua.user_id = target_user_id AND q.topic_id = target_topic_id
            ), 0) * COALESCE((
                SELECT COUNT(*)
                FROM user_answers ua 
                JOIN questions q ON ua.question_id = q.question_id
                WHERE ua.user_id = target_user_id AND q.topic_id = target_topic_id
            ), 0) + 
            EXCLUDED.proficiency_level * EXCLUDED.questions_attempted
        ) / GREATEST(
            COALESCE((
                SELECT COUNT(*)
                FROM user_answers ua 
                JOIN questions q ON ua.question_id = q.question_id
                WHERE ua.user_id = target_user_id AND q.topic_id = target_topic_id
            ), 0) + EXCLUDED.questions_attempted, 1
        ),
        questions_attempted = COALESCE((
            SELECT COUNT(*)
            FROM user_answers ua 
            JOIN questions q ON ua.question_id = q.question_id
            WHERE ua.user_id = target_user_id AND q.topic_id = target_topic_id
        ), 0) + EXCLUDED.questions_attempted,
        questions_correct = COALESCE((
            SELECT SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)
            FROM user_answers ua 
            JOIN questions q ON ua.question_id = q.question_id
            WHERE ua.user_id = target_user_id AND q.topic_id = target_topic_id
        ), 0) + EXCLUDED.questions_correct,
        last_activity = GREATEST(user_topic_progress.last_activity, EXCLUDED.last_activity);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- CREATE TRIGGERS
-- =============================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS user_answers_analytics_trigger ON user_answers;
DROP TRIGGER IF EXISTS user_answers_progress_trigger ON user_answers;
DROP TRIGGER IF EXISTS flashcards_analytics_trigger ON flashcards;

-- Create triggers for user_answers table
CREATE TRIGGER user_answers_analytics_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_user_analytics_from_answers();

CREATE TRIGGER user_answers_progress_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_user_topic_progress_from_answers();

-- Create triggers for flashcards table
CREATE TRIGGER flashcards_analytics_trigger
    AFTER INSERT OR UPDATE OR DELETE ON flashcards
    FOR EACH ROW
    EXECUTE FUNCTION update_user_analytics_from_flashcards();

-- =============================================
-- INITIAL POPULATION (Run once to populate existing data)
-- =============================================

-- Populate from existing user_answers
INSERT INTO user_analytics (user_id, date, topic_id, total_questions, correct_answers, average_time_seconds)
SELECT 
    ua.user_id,
    DATE(ua.created_at) as date,
    q.topic_id,
    COUNT(*) as total_questions,
    SUM(CASE WHEN ua.is_correct = true THEN 1 ELSE 0 END) as correct_answers,
    AVG(ua.time_taken_seconds) as average_time_seconds
FROM user_answers ua
JOIN questions q ON ua.question_id = q.question_id
WHERE q.topic_id IS NOT NULL
GROUP BY ua.user_id, DATE(ua.created_at), q.topic_id
ON CONFLICT (user_id, date, topic_id) DO UPDATE SET
    total_questions = EXCLUDED.total_questions,
    correct_answers = EXCLUDED.correct_answers,
    average_time_seconds = EXCLUDED.average_time_seconds;

-- Populate from existing user_answers (topic progress)
INSERT INTO user_topic_progress (user_id, topic_id, proficiency_level, questions_attempted, questions_correct, last_activity)
SELECT 
    ua.user_id,
    q.topic_id,
    CASE 
        WHEN COUNT(*) > 0 THEN 
            CAST(SUM(CASE WHEN ua.is_correct = true THEN 1 ELSE 0 END) AS DECIMAL) / COUNT(*)
        ELSE 0 
    END as proficiency_level,
    COUNT(*) as questions_attempted,
    SUM(CASE WHEN ua.is_correct = true THEN 1 ELSE 0 END) as questions_correct,
    MAX(ua.created_at) as last_activity
FROM user_answers ua
JOIN questions q ON ua.question_id = q.question_id
WHERE q.topic_id IS NOT NULL
GROUP BY ua.user_id, q.topic_id
ON CONFLICT (user_id, topic_id) DO UPDATE SET
    proficiency_level = EXCLUDED.proficiency_level,
    questions_attempted = EXCLUDED.questions_attempted,
    questions_correct = EXCLUDED.questions_correct,
    last_activity = EXCLUDED.last_activity;

-- Show summary
SELECT 
    'Analytics Auto-Population Setup Complete!' as status,
    COUNT(*) as user_analytics_records
FROM user_analytics
UNION ALL
SELECT 
    'Topic Progress Records:' as status,
    COUNT(*) as records
FROM user_topic_progress;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Test the triggers by showing some sample data
SELECT 
    'Sample user_analytics (most recent):' as info,
    user_id::text,
    date::text,
    topic_id::text,
    total_questions::text,
    correct_answers::text,
    ROUND(average_time_seconds, 2)::text as avg_time
FROM user_analytics 
ORDER BY date DESC 
LIMIT 5;

SELECT 
    'Sample user_topic_progress (highest proficiency):' as info,
    user_id::text,
    topic_id::text,
    ROUND(proficiency_level, 3)::text as proficiency,
    questions_attempted::text,
    questions_correct::text
FROM user_topic_progress 
ORDER BY proficiency_level DESC 
LIMIT 5; 