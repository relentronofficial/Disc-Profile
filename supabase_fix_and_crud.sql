-- 1. Reset Question Sequence
-- This fixes the 'duplicate key' error by setting the auto-increment counter 
-- to the next available number above your current questions.
SELECT setval(pg_get_serial_sequence('questions', 'id'), COALESCE((SELECT MAX(id)+1 FROM questions), 1), false);

-- 2. Add Delete Policy (If not already there)
-- This ensures the 'Delete' button in the Admin UI actually has permission to work.
CREATE POLICY "Enable delete for all" ON questions FOR DELETE USING (true);
CREATE POLICY "Enable delete for profiles" ON disc_profiles FOR DELETE USING (true);
