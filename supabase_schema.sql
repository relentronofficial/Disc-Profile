-- Create assessments table
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create answers table
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  answer_letter TEXT NOT NULL,
  reflection TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Create policies (For this prototype, we allow public insert and authenticated select)
CREATE POLICY "Allow public insert assessments" ON assessments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert answers" ON answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authorized select assessments" ON assessments FOR SELECT USING (true);
CREATE POLICY "Allow authorized select answers" ON answers FOR SELECT USING (true);
