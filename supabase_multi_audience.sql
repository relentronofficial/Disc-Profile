-- Create assessment_categories table
CREATE TABLE IF NOT EXISTS assessment_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create question_sets table
CREATE TABLE IF NOT EXISTS question_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES assessment_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_audience TEXT,
  version TEXT DEFAULT '1.0',
  status TEXT DEFAULT 'active',
  total_questions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create question_set_questions mapping table
CREATE TABLE IF NOT EXISTS question_set_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_set_id UUID REFERENCES question_sets(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(question_set_id, question_id)
);

-- Enable RLS
ALTER TABLE assessment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_set_questions ENABLE ROW LEVEL SECURITY;

-- Policies for assessment_categories
CREATE POLICY "Allow public select categories" ON assessment_categories FOR SELECT USING (true);
CREATE POLICY "Allow authorized manage categories" ON assessment_categories FOR ALL USING (true);

-- Policies for question_sets
CREATE POLICY "Allow public select question_sets" ON question_sets FOR SELECT USING (true);
CREATE POLICY "Allow authorized manage question_sets" ON question_sets FOR ALL USING (true);

-- Policies for question_set_questions
CREATE POLICY "Allow public select question_set_questions" ON question_set_questions FOR SELECT USING (true);
CREATE POLICY "Allow authorized manage question_set_questions" ON question_set_questions FOR ALL USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE assessment_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE question_sets;
ALTER PUBLICATION supabase_realtime ADD TABLE question_set_questions;

-- Update assessments table to support category tracking
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES assessment_categories(id) ON DELETE SET NULL;
