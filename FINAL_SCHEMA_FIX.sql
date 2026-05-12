-- FINAL SCHEMA FIX: Ensure all columns and tables exist for assessment saving

-- 1. Create assessment_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS assessment_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ensure assessments table has all required columns
-- Adding category_id
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES assessment_categories(id) ON DELETE SET NULL;

-- Adding mobile_number (used in the saveAssessmentResult action)
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS mobile_number TEXT;

-- 3. Enable RLS and Policies (Ensuring they are correct for public insertion)
ALTER TABLE assessment_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select categories" ON assessment_categories FOR SELECT USING (true);
CREATE POLICY "Allow authorized manage categories" ON assessment_categories FOR ALL USING (true);

-- Ensure assessments has public insert policy
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'assessments' AND policyname = 'Public insert assessments'
    ) THEN
        CREATE POLICY "Public insert assessments" ON assessments FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- 4. Enable Realtime (optional but recommended for Admin Dashboard)
ALTER PUBLICATION supabase_realtime ADD TABLE assessment_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE assessments;

-- Refresh Schema Cache (Handled automatically by Supabase, but good to know)
-- Note: If you still see the error, try clicking "Reload Schema" in Supabase API settings or wait 30 seconds.
