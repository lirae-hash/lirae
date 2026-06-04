-- Add final_words column to playthroughs table
-- This stores the reader's final words to the love interest at the end of chapter 9

ALTER TABLE playthroughs
ADD COLUMN IF NOT EXISTS final_words TEXT DEFAULT NULL;
