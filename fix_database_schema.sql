-- SUPABASE SCHEMA FIX: ADD MISSING COLUMNS
-- Run this in your Supabase SQL Editor to resolve the "column not found" errors.

-- 1. Add 'status' to 'questions' table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
UPDATE questions SET status = 'active' WHERE status IS NULL;

-- 2. Add 'show_tags' to 'question_sets' table
ALTER TABLE question_sets ADD COLUMN IF NOT EXISTS show_tags BOOLEAN DEFAULT TRUE;
UPDATE question_sets SET show_tags = TRUE WHERE show_tags IS NULL;

-- 3. Verify 'assessment_categories' has 'status' (required for filtering)
ALTER TABLE assessment_categories ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- NOTE: If you still see errors after running this, go to:
-- Dashboard -> Project Settings -> API -> PostgREST -> "Reload Schema"
