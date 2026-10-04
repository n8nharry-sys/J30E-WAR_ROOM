-- Add photo_path column to employees table for avatar images in champion/dept views

ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS photo_path text DEFAULT '';

-- Update existing rows to have empty string default
UPDATE employees SET photo_path = '' WHERE photo_path IS NULL;