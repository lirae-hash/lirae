-- Allow anonymous playthroughs for chapters 1-3
-- reader_id becomes nullable, anonymous_token tracks the session

-- Make reader_id nullable
ALTER TABLE playthroughs
ALTER COLUMN reader_id DROP NOT NULL;

-- Add anonymous token for session tracking
ALTER TABLE playthroughs
ADD COLUMN IF NOT EXISTS anonymous_token TEXT DEFAULT NULL;

-- Create index for anonymous token lookups
CREATE INDEX IF NOT EXISTS idx_playthroughs_anonymous_token
ON playthroughs(anonymous_token)
WHERE anonymous_token IS NOT NULL;

-- Update RLS policies to allow anonymous playthrough access
-- Allow anyone to read their own anonymous playthrough (by ID, no auth required for ch 1-3)
DROP POLICY IF EXISTS "Users can view own playthroughs" ON playthroughs;
CREATE POLICY "Users can view own playthroughs" ON playthroughs
  FOR SELECT USING (
    reader_id = auth.uid()
    OR reader_id IS NULL
  );

-- Allow anonymous inserts (for creating playthrough without auth)
DROP POLICY IF EXISTS "Users can create playthroughs" ON playthroughs;
CREATE POLICY "Users can create playthroughs" ON playthroughs
  FOR INSERT WITH CHECK (
    reader_id = auth.uid()
    OR reader_id IS NULL
  );

-- Allow updates (for claiming anonymous playthrough or making choices)
DROP POLICY IF EXISTS "Users can update own playthroughs" ON playthroughs;
CREATE POLICY "Users can update own playthroughs" ON playthroughs
  FOR UPDATE USING (
    reader_id = auth.uid()
    OR reader_id IS NULL
  );
