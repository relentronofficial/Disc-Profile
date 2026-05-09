-- Create questions table
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  section INTEGER NOT NULL,
  tag TEXT NOT NULL,
  text TEXT NOT NULL,
  instruction TEXT NOT NULL,
  options JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create disc_profiles table
CREATE TABLE disc_profiles (
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

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disc_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public select questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Admin manage questions" ON questions FOR ALL USING (true);
CREATE POLICY "Public select disc_profiles" ON disc_profiles FOR SELECT USING (true);
CREATE POLICY "Admin manage disc_profiles" ON disc_profiles FOR ALL USING (true);
