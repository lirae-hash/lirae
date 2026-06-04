-- Add archetype column to chapters_cache for proper caching
-- Different archetypes produce different chapter content

ALTER TABLE chapters_cache
ADD COLUMN IF NOT EXISTS archetype TEXT DEFAULT NULL;

-- Drop old unique constraint that doesn't include archetype
ALTER TABLE chapters_cache
DROP CONSTRAINT IF EXISTS chapters_cache_adventure_id_chapter_no_vibe_spice_path_hash_key;

-- Clear existing data since it's missing archetype info
-- (This is safe since cache is just an optimization)
TRUNCATE TABLE chapters_cache;

-- Add unique constraint on all cache key columns including archetype
CREATE UNIQUE INDEX IF NOT EXISTS idx_chapters_cache_unique
ON chapters_cache(adventure_id, chapter_no, vibe, spice, archetype, path_hash);
