-- Fix chapters_cache RLS policy to allow inserts from authenticated users
-- The cache is shared across all users, keyed by adventure/chapter/vibe/spice/path

-- Allow authenticated users to read from cache
CREATE POLICY IF NOT EXISTS "Anyone can read chapters cache"
  ON chapters_cache FOR SELECT
  USING (true);

-- Allow authenticated users to insert into cache
CREATE POLICY IF NOT EXISTS "Authenticated users can insert chapters cache"
  ON chapters_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Alternative: If above doesn't work, try dropping and recreating
-- DROP POLICY IF EXISTS "Anyone can read chapters cache" ON chapters_cache;
-- DROP POLICY IF EXISTS "Authenticated users can insert chapters cache" ON chapters_cache;
-- CREATE POLICY "Anyone can read chapters cache" ON chapters_cache FOR SELECT USING (true);
-- CREATE POLICY "Authenticated users can insert chapters cache" ON chapters_cache FOR INSERT TO authenticated WITH CHECK (true);
