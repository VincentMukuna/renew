export const migration = {
  version: 2,
  sql: `
ALTER TABLE categories ADD COLUMN emoji TEXT NOT NULL DEFAULT '📦';

UPDATE categories
SET emoji = CASE id
  WHEN 'cat_productivity' THEN '⚡'
  WHEN 'cat_wellness' THEN '🧘'
  WHEN 'cat_business' THEN '💼'
  WHEN 'cat_finance' THEN '💰'
  WHEN 'cat_entertainment' THEN '🎬'
  WHEN 'cat_utilities' THEN '🛠️'
  WHEN 'cat_cloud_storage' THEN '☁️'
  WHEN 'cat_education' THEN '🎓'
  WHEN 'cat_shopping' THEN '🛍️'
  WHEN 'cat_other' THEN '📦'
  ELSE emoji
END;
`,
} as const;
