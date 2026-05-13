-- Migration to add show_tags column to question_sets table
ALTER TABLE question_sets ADD COLUMN IF NOT EXISTS show_tags BOOLEAN DEFAULT TRUE;

-- Update existing records to TRUE if they are NULL
UPDATE question_sets SET show_tags = TRUE WHERE show_tags IS NULL;
