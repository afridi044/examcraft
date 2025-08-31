-- =============================================
-- Complete RLS Policies for ExamCraft Database
-- This script enables RLS on all tables and creates service role policies
-- =============================================

-- Enable RLS and create service role policies for all tables
-- Service role bypasses RLS, allowing your backend full access

-- =============================================
-- User Management
-- =============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;
CREATE POLICY "Service role can manage all users" ON public.users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================
-- Topics
-- =============================================

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all topics" ON public.topics;
CREATE POLICY "Service role can manage all topics" ON public.topics
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================
-- Questions
-- =============================================

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all questions" ON public.questions;
CREATE POLICY "Service role can manage all questions" ON public.questions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all question_options" ON public.question_options;
CREATE POLICY "Service role can manage all question_options" ON public.question_options
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================
-- Quizzes
-- =============================================

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all quizzes" ON public.quizzes;
CREATE POLICY "Service role can manage all quizzes" ON public.quizzes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all quiz_questions" ON public.quiz_questions;
CREATE POLICY "Service role can manage all quiz_questions" ON public.quiz_questions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.quiz_completions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all quiz_completions" ON public.quiz_completions;
CREATE POLICY "Service role can manage all quiz_completions" ON public.quiz_completions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================
-- Exams
-- =============================================

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all exams" ON public.exams;
CREATE POLICY "Service role can manage all exams" ON public.exams
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all exam_questions" ON public.exam_questions;
CREATE POLICY "Service role can manage all exam_questions" ON public.exam_questions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all exam_sessions" ON public.exam_sessions;
CREATE POLICY "Service role can manage all exam_sessions" ON public.exam_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================
-- User Answers
-- =============================================

ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all user_answers" ON public.user_answers;
CREATE POLICY "Service role can manage all user_answers" ON public.user_answers
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================
-- Flashcards
-- =============================================

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all flashcards" ON public.flashcards;
CREATE POLICY "Service role can manage all flashcards" ON public.flashcards
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================
-- Explanations
-- =============================================

ALTER TABLE public.explanations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all explanations" ON public.explanations;
CREATE POLICY "Service role can manage all explanations" ON public.explanations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================
-- Educational Resources
-- =============================================

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all resources" ON public.resources;
CREATE POLICY "Service role can manage all resources" ON public.resources
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.question_resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all question_resources" ON public.question_resources;
CREATE POLICY "Service role can manage all question_resources" ON public.question_resources
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================
-- Analytics Tables
-- =============================================

ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all user_analytics" ON public.user_analytics;
CREATE POLICY "Service role can manage all user_analytics" ON public.user_analytics
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.exam_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all exam_analytics" ON public.exam_analytics;
CREATE POLICY "Service role can manage all exam_analytics" ON public.exam_analytics
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE public.user_topic_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all user_topic_progress" ON public.user_topic_progress;
CREATE POLICY "Service role can manage all user_topic_progress" ON public.user_topic_progress
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================
-- Study Notes
-- =============================================

ALTER TABLE public.study_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all study_notes" ON public.study_notes;
CREATE POLICY "Service role can manage all study_notes" ON public.study_notes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================
-- Books
-- =============================================

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage all books" ON public.books;
CREATE POLICY "Service role can manage all books" ON public.books
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================
-- Verification Query
-- =============================================

-- Run this to verify all policies are created correctly
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
