import type { CategoryDetailView } from "@/features/subscriptions/view-models";
import { getDb } from "@/lib/db/client";
import type { CategoriesRow } from "@/lib/db/row-types";
import { createId } from "@/lib/id";
import type { Category } from "@/types";

function toCategory(row: CategoriesRow): Category {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    sortOrder: row.sort_order,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const categoryRepository = {
  async list(): Promise<Category[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<CategoriesRow>(
      `SELECT * FROM categories
       WHERE archived_at IS NULL
       ORDER BY sort_order ASC, name ASC`,
    );

    return rows.map(toCategory);
  },

  async getById(id: string): Promise<CategoryDetailView | undefined> {
    const db = await getDb();
    const row = await db.getFirstAsync<CategoriesRow>(
      `SELECT * FROM categories
       WHERE id = ? AND archived_at IS NULL`,
      [id],
    );

    if (!row) {
      return undefined;
    }

    const usage = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) AS count
       FROM subscriptions
       WHERE category_id = ? AND archived_at IS NULL`,
      [id],
    );

    return {
      ...toCategory(row),
      subscriptionCount: usage?.count ?? 0,
    };
  },

  async create(input: { name: string; emoji: string }): Promise<Category> {
    const db = await getDb();
    const now = new Date().toISOString();
    const row = await db.getFirstAsync<{ sort_order: number | null }>(
      "SELECT MAX(sort_order) AS sort_order FROM categories",
    );
    const category: CategoriesRow = {
      id: createId(),
      name: input.name.trim(),
      emoji: input.emoji.trim(),
      sort_order: (row?.sort_order ?? 0) + 10,
      archived_at: null,
      created_at: now,
      updated_at: now,
    };

    await db.runAsync(
      `INSERT INTO categories (id, name, emoji, sort_order, archived_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, NULL, ?, ?)`,
      [
        category.id,
        category.name,
        category.emoji,
        category.sort_order,
        category.created_at,
        category.updated_at,
      ],
    );

    return toCategory(category);
  },

  async update(id: string, input: { name: string; emoji: string }): Promise<Category> {
    const db = await getDb();
    const now = new Date().toISOString();

    await db.runAsync(
      `UPDATE categories
       SET name = ?, emoji = ?, updated_at = ?
       WHERE id = ? AND archived_at IS NULL`,
      [input.name.trim(), input.emoji.trim(), now, id],
    );

    const row = await db.getFirstAsync<CategoriesRow>("SELECT * FROM categories WHERE id = ?", [
      id,
    ]);

    if (!row) {
      throw new Error(`Category not found: ${id}`);
    }

    return toCategory(row);
  },

  async rename(id: string, name: string): Promise<Category> {
    const existing = await this.list();
    const category = existing.find((item) => item.id === id);

    if (!category) {
      throw new Error(`Category not found: ${id}`);
    }

    return this.update(id, { name, emoji: category.emoji });
  },

  async archive(id: string): Promise<void> {
    const db = await getDb();
    const usage = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) AS count
       FROM subscriptions
       WHERE category_id = ? AND archived_at IS NULL`,
      [id],
    );

    if ((usage?.count ?? 0) > 0) {
      throw new Error("Category is used by subscriptions");
    }

    const now = new Date().toISOString();
    await db.runAsync("UPDATE categories SET archived_at = ?, updated_at = ? WHERE id = ?", [
      now,
      now,
      id,
    ]);
  },
};
