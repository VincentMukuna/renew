import { getDb } from "@/lib/db/client";
import { createId } from "@/lib/id";
import type { Recurrence } from "@/types";

export const SEED_SUBSCRIPTION_COUNT = 28;

type SeedSubscription = {
  name: string;
  planName: string;
  categoryId: string;
  costAmount: number;
  recurrence: Recurrence;
  isActive: boolean;
  startDate: string;
};

export type SeedSubscriptionsResult = {
  subscriptions: number;
};

const SAMPLE_SUBSCRIPTIONS: Omit<SeedSubscription, "startDate">[] = [
  { name: "Netflix", planName: "Standard", categoryId: "cat_entertainment", costAmount: 1100, recurrence: "monthly", isActive: true },
  { name: "Spotify", planName: "Individual", categoryId: "cat_entertainment", costAmount: 399, recurrence: "monthly", isActive: true },
  { name: "ChatGPT", planName: "Plus", categoryId: "cat_productivity", costAmount: 2600, recurrence: "monthly", isActive: true },
  { name: "iCloud", planName: "200 GB", categoryId: "cat_cloud_storage", costAmount: 399, recurrence: "monthly", isActive: true },
  { name: "Google Workspace", planName: "Business Starter", categoryId: "cat_business", costAmount: 870, recurrence: "monthly", isActive: true },
  { name: "Notion", planName: "Plus", categoryId: "cat_productivity", costAmount: 1040, recurrence: "monthly", isActive: true },
  { name: "Figma", planName: "Professional", categoryId: "cat_productivity", costAmount: 1560, recurrence: "monthly", isActive: true },
  { name: "Linear", planName: "Basic", categoryId: "cat_productivity", costAmount: 1040, recurrence: "monthly", isActive: true },
  { name: "GitHub", planName: "Pro", categoryId: "cat_business", costAmount: 520, recurrence: "monthly", isActive: true },
  { name: "Vercel", planName: "Pro", categoryId: "cat_business", costAmount: 2600, recurrence: "monthly", isActive: true },
  { name: "Namecheap", planName: "Domain", categoryId: "cat_business", costAmount: 1800, recurrence: "yearly", isActive: true },
  { name: "Cloudflare", planName: "Pro", categoryId: "cat_utilities", costAmount: 2600, recurrence: "monthly", isActive: true },
  { name: "NordVPN", planName: "Standard", categoryId: "cat_utilities", costAmount: 10800, recurrence: "yearly", isActive: true },
  { name: "YouTube Premium", planName: "Individual", categoryId: "cat_entertainment", costAmount: 499, recurrence: "monthly", isActive: true },
  { name: "Apple Music", planName: "Individual", categoryId: "cat_entertainment", costAmount: 499, recurrence: "monthly", isActive: false },
  { name: "Coursera", planName: "Plus", categoryId: "cat_education", costAmount: 7800, recurrence: "yearly", isActive: true },
  { name: "Skillshare", planName: "Annual", categoryId: "cat_education", costAmount: 3900, recurrence: "yearly", isActive: false },
  { name: "Headspace", planName: "Annual", categoryId: "cat_wellness", costAmount: 5200, recurrence: "yearly", isActive: true },
  { name: "Gym", planName: "Monthly", categoryId: "cat_wellness", costAmount: 4500, recurrence: "monthly", isActive: true },
  { name: "Adobe", planName: "Photography", categoryId: "cat_productivity", costAmount: 1300, recurrence: "monthly", isActive: true },
  { name: "Dropbox", planName: "Plus", categoryId: "cat_cloud_storage", costAmount: 1560, recurrence: "monthly", isActive: false },
  { name: "Canva", planName: "Pro", categoryId: "cat_productivity", costAmount: 1500, recurrence: "monthly", isActive: true },
  { name: "Todoist", planName: "Pro", categoryId: "cat_productivity", costAmount: 520, recurrence: "monthly", isActive: true },
  { name: "YNAB", planName: "Annual", categoryId: "cat_finance", costAmount: 12800, recurrence: "yearly", isActive: true },
  { name: "1Password", planName: "Family", categoryId: "cat_utilities", costAmount: 780, recurrence: "monthly", isActive: true },
  { name: "Amazon Prime", planName: "Annual", categoryId: "cat_shopping", costAmount: 18000, recurrence: "yearly", isActive: true },
  { name: "Grammarly", planName: "Premium", categoryId: "cat_productivity", costAmount: 3900, recurrence: "quarterly", isActive: false },
  { name: "Setapp", planName: "Power User", categoryId: "cat_productivity", costAmount: 1950, recurrence: "monthly", isActive: true },
];

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildStartDate(index: number, now: Date): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  date.setMonth(date.getMonth() - (index % 18));
  date.setDate(((index * 3) % 26) + 1);
  return toISODate(date);
}

export async function seedSubscriptions(): Promise<SeedSubscriptionsResult> {
  const db = await getDb();
  const now = new Date();
  const nowIso = now.toISOString();
  const sample = SAMPLE_SUBSCRIPTIONS.slice(0, SEED_SUBSCRIPTION_COUNT).map((subscription, index) => ({
    ...subscription,
    startDate: buildStartDate(index, now),
  }));

  await db.withTransactionAsync(async () => {
    for (const subscription of sample) {
      const id = createId();
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
        [
          id,
          subscription.categoryId,
          subscription.name,
          subscription.planName,
          subscription.costAmount,
          subscription.startDate,
          subscription.recurrence,
          subscription.isActive ? 1 : 0,
          nowIso,
          nowIso,
        ],
      );

      await db.runAsync(
        `INSERT INTO subscription_events (id, subscription_id, type, occurred_at, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [createId(), id, "subscription_created", nowIso, nowIso],
      );
    }
  });

  return { subscriptions: sample.length };
}
