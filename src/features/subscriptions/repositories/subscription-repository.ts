import type {
  CreateSubscriptionInput,
  SubscriptionSummary,
  UpdateSubscriptionInput,
} from "@/features/subscriptions/view-models";
import { getDb } from "@/lib/db/client";
import type { SubscriptionsRow } from "@/lib/db/row-types";
import { createId } from "@/lib/id";
import type { Subscription } from "@/types";

function toSubscription(row: SubscriptionsRow): Subscription {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    planName: row.plan_name,
    costAmount: row.cost_amount,
    startDate: row.start_date,
    recurrence: row.recurrence as Subscription["recurrence"],
    isActive: row.is_active === 1,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

type SubscriptionCategoryRow = SubscriptionsRow & {
  category_name: string;
};

function toSummary(row: SubscriptionCategoryRow): SubscriptionSummary {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.category_name,
    name: row.name,
    planName: row.plan_name,
    costAmount: row.cost_amount,
    startDate: row.start_date,
    recurrence: row.recurrence as SubscriptionSummary["recurrence"],
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SUBSCRIPTION_SUMMARY_SELECT = `
  SELECT
    s.*,
    c.name AS category_name
  FROM subscriptions s
  INNER JOIN categories c ON c.id = s.category_id
`;

export const subscriptionRepository = {
  async listSummaries(): Promise<SubscriptionSummary[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<SubscriptionCategoryRow>(
      `${SUBSCRIPTION_SUMMARY_SELECT}
       WHERE s.archived_at IS NULL
       ORDER BY s.is_active DESC, s.name COLLATE NOCASE ASC`,
    );

    return rows.map(toSummary);
  },

  async list(): Promise<SubscriptionSummary[]> {
    return this.listSummaries();
  },

  async getById(id: string): Promise<SubscriptionSummary | undefined> {
    const db = await getDb();
    const row = await db.getFirstAsync<SubscriptionCategoryRow>(
      `${SUBSCRIPTION_SUMMARY_SELECT}
       WHERE s.id = ? AND s.archived_at IS NULL`,
      [id],
    );

    return row ? toSummary(row) : undefined;
  },

  async create(input: CreateSubscriptionInput): Promise<Subscription> {
    const db = await getDb();
    const now = new Date().toISOString();
    const id = createId();

    const category = await db.getFirstAsync<{ id: string }>(
      `SELECT id FROM categories WHERE id = ? AND archived_at IS NULL`,
      [input.categoryId],
    );

    if (!category) {
      throw new Error(`Category not found: ${input.categoryId}`);
    }

    const row: SubscriptionsRow = {
      id,
      category_id: input.categoryId,
      name: input.name.trim(),
      plan_name: input.planName.trim(),
      cost_amount: input.costAmount,
      start_date: input.startDate,
      recurrence: input.recurrence,
      is_active: input.isActive ? 1 : 0,
      archived_at: null,
      created_at: now,
      updated_at: now,
    };

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO subscriptions (
          id,
          category_id,
          name,
          plan_name,
          cost_amount,
          start_date,
          recurrence,
          is_active,
          archived_at,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
        row.id,
        row.category_id,
        row.name,
        row.plan_name,
        row.cost_amount,
        row.start_date,
        row.recurrence,
        row.is_active,
        row.created_at,
        row.updated_at,
      );

      await db.runAsync(
        `INSERT INTO subscription_events (id, subscription_id, type, occurred_at, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        createId(),
        id,
        "subscription_created",
        now,
        now,
      );
    });

    return toSubscription(row);
  },

  async update(id: string, input: UpdateSubscriptionInput): Promise<SubscriptionSummary> {
    const existing = await this.getById(id);

    if (!existing) {
      throw new Error(`Subscription not found: ${id}`);
    }

    const db = await getDb();
    const now = new Date().toISOString();
    const next = {
      categoryId: input.categoryId ?? existing.categoryId,
      name: input.name?.trim() ?? existing.name,
      planName: input.planName?.trim() ?? existing.planName,
      costAmount: input.costAmount ?? existing.costAmount,
      startDate: input.startDate ?? existing.startDate,
      recurrence: input.recurrence ?? existing.recurrence,
      isActive: input.isActive ?? existing.isActive,
    };

    const category = await db.getFirstAsync<{ id: string }>(
      `SELECT id FROM categories WHERE id = ? AND archived_at IS NULL`,
      [next.categoryId],
    );

    if (!category) {
      throw new Error(`Category not found: ${next.categoryId}`);
    }

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `UPDATE subscriptions
         SET category_id = ?,
             name = ?,
             plan_name = ?,
             cost_amount = ?,
             start_date = ?,
             recurrence = ?,
             is_active = ?,
             updated_at = ?
         WHERE id = ? AND archived_at IS NULL`,
        [
          next.categoryId,
          next.name,
          next.planName,
          next.costAmount,
          next.startDate,
          next.recurrence,
          next.isActive ? 1 : 0,
          now,
          id,
        ],
      );

      await db.runAsync(
        `INSERT INTO subscription_events (id, subscription_id, type, occurred_at, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          createId(),
          id,
          existing.isActive !== next.isActive
            ? next.isActive
              ? "subscription_reactivated"
              : "subscription_deactivated"
            : "subscription_updated",
          now,
          now,
        ],
      );
    });

    const updated = await this.getById(id);

    if (!updated) {
      throw new Error(`Subscription not found after update: ${id}`);
    }

    return updated;
  },

  async setActive(id: string, isActive: boolean): Promise<SubscriptionSummary> {
    return this.update(id, { isActive });
  },
};
