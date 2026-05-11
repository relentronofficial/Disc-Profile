-- Update assessments table to include all necessary fields
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS mobile_number TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS secondary_type TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS blend_label TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS intensity_level TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS behavioral_summary TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS communication_style TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS decision_making TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS leadership_style TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS stress_response TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS growth_recommendations TEXT;

-- Verify policies are still correct
-- (They should be if they were already set to 'true' for insert/select)

-- Enable Realtime for assessments table
-- Note: This is usually done via the Supabase Dashboard, but can be done via SQL
ALTER PUBLICATION supabase_realtime ADD TABLE assessments;
