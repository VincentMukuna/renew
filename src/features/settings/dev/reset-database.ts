import { getDb } from "@/lib/db/client";

export async function resetDatabase(): Promise<void> {
  const db = await getDb();

  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      DELETE FROM subscription_events;
      DELETE FROM subscriptions;
    `);
  });
}
