-- ==========================================
-- UNIFIED SUPABASE SCHEMA (RUN THIS ALL AT ONCE)
-- ==========================================

-- 1. CLEANUP (Optional: Only if you want to reset everything)
-- DROP TABLE IF EXISTS answers;
-- DROP TABLE IF EXISTS assessments;
-- DROP TABLE IF EXISTS questions;
-- DROP TABLE IF EXISTS disc_profiles;

-- 2. CREATE TABLES
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  city TEXT,
  business TEXT,
  score_d INTEGER NOT NULL,
  score_i INTEGER NOT NULL,
  score_s INTEGER NOT NULL,
  score_c INTEGER NOT NULL,
  dominant_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  answer_letter TEXT NOT NULL,
  reflection TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  section INTEGER NOT NULL,
  tag TEXT NOT NULL,
  text TEXT NOT NULL,
  instruction TEXT NOT NULL,
  options JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disc_profiles (
  letter CHAR(1) PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  color TEXT NOT NULL,
  dim_color TEXT NOT NULL,
  edge TEXT NOT NULL,
  pattern TEXT NOT NULL,
  watch TEXT NOT NULL,
  prescription TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ENABLE RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disc_profiles ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES
-- NOTE: 'USING (true)' allows reading/inserting. For production, you should restrict 'ALL' to authenticated users.

-- Assessments & Answers
CREATE POLICY "Public insert assessments" ON assessments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert answers" ON answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public select assessments" ON assessments FOR SELECT USING (true);
CREATE POLICY "Public select answers" ON answers FOR SELECT USING (true);

-- Questions & Profiles
CREATE POLICY "Public select questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Admin manage questions" ON questions FOR ALL USING (true);
CREATE POLICY "Public select disc_profiles" ON disc_profiles FOR SELECT USING (true);
CREATE POLICY "Admin manage disc_profiles" ON disc_profiles FOR ALL USING (true);
