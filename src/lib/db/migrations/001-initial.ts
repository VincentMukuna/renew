export const migration = {
  version: 1,
  sql: `
CREATE TABLE categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  archived_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  cost_amount INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  recurrence TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  archived_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE subscription_events (
  id TEXT PRIMARY KEY NOT NULL,
  subscription_id TEXT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE schema_migrations (
  version INTEGER PRIMARY KEY NOT NULL
);

CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_subscriptions_category_id ON subscriptions(category_id);
CREATE INDEX idx_subscriptions_active ON subscriptions(is_active);
CREATE INDEX idx_subscriptions_start_date ON subscriptions(start_date);
CREATE INDEX idx_subscription_events_subscription_id ON subscription_events(subscription_id);
CREATE INDEX idx_subscription_events_occurred_at ON subscription_events(occurred_at DESC);

INSERT INTO categories (id, name, sort_order, archived_at, created_at, updated_at) VALUES
  ('cat_productivity', 'Productivity', 10, NULL, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('cat_wellness', 'Wellness', 20, NULL, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('cat_business', 'Business', 30, NULL, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('cat_finance', 'Finance', 40, NULL, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('cat_entertainment', 'Entertainment', 50, NULL, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('cat_utilities', 'Utilities', 60, NULL, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('cat_cloud_storage', 'Cloud & Storage', 70, NULL, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('cat_education', 'Education', 80, NULL, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('cat_shopping', 'Shopping', 90, NULL, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  ('cat_other', 'Other', 100, NULL, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
`,
} as const;
