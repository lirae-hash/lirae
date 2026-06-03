-- Seed "The Kitchen" adventure
-- Run this in Supabase SQL Editor after schema.sql

INSERT INTO adventures (id, title, trope, blurb, setting_sheet, published, sort_order)
VALUES (
  'the-kitchen',
  'The Kitchen',
  'enemies-to-lovers',
  'A pastry chef with a score to settle. The chef who destroyed her reputation. One Michelin-starred kitchen. Paris.',
  '{
    "heroName": "Julian Voss",
    "setting": "Michelin-starred restaurant world, Paris",
    "worldDetails": {
      "timePeriod": "Contemporary",
      "hisRole": "Executive Chef and sole owner of Le Sorel",
      "herRole": "Newly hired Head Pastry Chef"
    }
  }'::jsonb,
  true,
  1
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  blurb = EXCLUDED.blurb,
  published = EXCLUDED.published;
