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
-- Basic Fields
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES assessment_categories(id) ON DELETE SET NULL;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS mobile_number TEXT;

-- Profiles Enhancement
ALTER TABLE disc_profiles ADD COLUMN IF NOT EXISTS traits JSONB;

-- Analysis & Behavioral Insight Fields
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS secondary_type TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS blend_label TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS intensity_level TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS behavioral_summary TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS communication_style TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS decision_making TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS leadership_style TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS stress_response TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS growth_recommendations TEXT;

-- 3. Enable RLS and Policies (Ensuring they are correct for public insertion)
ALTER TABLE assessment_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select categories" ON assessment_categories FOR SELECT USING (true);

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
-- Using a DO block to avoid errors if already in publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'assessment_categories'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE assessment_categories;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'assessments'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE assessments;
    END IF;
END $$;

-- Refresh Schema Cache (Handled automatically by Supabase, but good to know)
-- Note: If you still see "column not found" errors, try clicking "Reload Schema" in Supabase API settings.
