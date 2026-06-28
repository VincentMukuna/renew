# Architecture Notes

Reneww inherits Owed's final MVP v1 technical posture.

## Owed Reference Map

Read these Owed files before implementing matching Reneww areas:

| Area | Owed file |
| --- | --- |
| Root bootstrap, QueryClientProvider, DB init, prefetch gate | `/Users/vincentmukuna/code/owed/src/app/_layout.tsx` |
| Tab route structure | `/Users/vincentmukuna/code/owed/src/app/(tabs)/_layout.tsx` |
| SQLite client singleton | `/Users/vincentmukuna/code/owed/src/lib/db/client.ts` |
| Migration runner | `/Users/vincentmukuna/code/owed/src/lib/db/migrations/index.ts` |
| Initial SQLite schema style | `/Users/vincentmukuna/code/owed/src/lib/db/migrations/001-initial.ts` |
| Row type naming | `/Users/vincentmukuna/code/owed/src/lib/db/row-types.ts` |
| Repository write/read pattern | `/Users/vincentmukuna/code/owed/src/features/debts/repositories/debt-repository.ts` |
| Hook to repository path, no fetch hop | `/Users/vincentmukuna/code/owed/src/features/debts/hooks/use-add-debt.ts` |
| Shared query loader pattern | `/Users/vincentmukuna/code/owed/src/features/debts/hooks/use-debts.ts` |
| Query keys | `/Users/vincentmukuna/code/owed/src/features/debts/hooks/query-keys.ts` |
| Post-mutation invalidation helper | `/Users/vincentmukuna/code/owed/src/lib/mutations/after-debt-domain-change.ts` |
| Query invalidation utilities | `/Users/vincentmukuna/code/owed/src/lib/query/invalidate-queries.ts` |
| Settings store | `/Users/vincentmukuna/code/owed/src/features/settings/hooks/use-settings-store.ts` |
| Settings persistence and theme application | `/Users/vincentmukuna/code/owed/src/features/reminders/lib/reminder-storage.ts` |
| Currency bootstrap | `/Users/vincentmukuna/code/owed/src/features/settings/lib/bootstrap-currency.ts` |
| Currency change flow | `/Users/vincentmukuna/code/owed/src/features/settings/hooks/use-change-currency.ts` |
| Settings screen grouping | `/Users/vincentmukuna/code/owed/src/features/settings/screens/settings-screen.tsx` |
| Home dashboard composition | `/Users/vincentmukuna/code/owed/src/features/dashboard/screens/home-screen.tsx` |
| Flat list wrapper / FlashList usage | `/Users/vincentmukuna/code/owed/src/components/debts/debt-list.tsx` |
| List item visual density | `/Users/vincentmukuna/code/owed/src/components/debts/debt-card.tsx` |
| List filtering utilities | `/Users/vincentmukuna/code/owed/src/features/debts/lib/debt-list-utils.ts` |
| View-model mappers | `/Users/vincentmukuna/code/owed/src/features/debts/lib/mappers.ts` |
| Date formatting helpers | `/Users/vincentmukuna/code/owed/src/features/debts/lib/format-dates.ts` |
| Notification permission style | `/Users/vincentmukuna/code/owed/src/features/reminders/lib/notification-permissions.ts` |
| Notification scheduling primitives | `/Users/vincentmukuna/code/owed/src/features/reminders/lib/reminder-scheduler.ts` |
| Notification service wrapper | `/Users/vincentmukuna/code/owed/src/features/reminders/lib/notification-service.ts` |
| Reminder sync shape to simplify from | `/Users/vincentmukuna/code/owed/src/features/reminders/lib/reminder-sync.ts` |
| Performance rules | `/Users/vincentmukuna/code/owed/docs/performance.md` |
| Persistence architecture decisions | `/Users/vincentmukuna/code/owed/docs/persistence-prd.md` |

## Decisions From Grilling

- Build a managed Expo foundation first; document prebuild, but do not commit `ios/` or `android/`.
- Use `renew` for technical identifiers and **Reneww** for product-facing UI.
- Use three tabs: Home, Subscriptions, Settings.
- Copy Owed's shipped UI patterns exactly before making Reneww-specific domain changes.
- Foundation pass renders empty shells only; concrete subscription CRUD lands in the next slice.
- Create the real SQLite schema now.
- Categories are a real table seeded in migration `001`.
- Install notification dependencies/config in the foundation, but leave scheduling logic for the simple upcoming-charge notifications MVP slice.
- `Total Spent` is an estimate from start date, recurrence, cost, and today.

## Data Flow

Use the Owed v1 data path:

```txt
Screens
  -> React Query hooks
  -> Repositories
  -> SQLite
  -> Pure mappers / derived view models
```

Do not add a `fetch-*` hop between hooks and repositories. Hooks should call repositories directly, then map to view models.

Relevant Owed examples:

- `/Users/vincentmukuna/code/owed/src/features/debts/hooks/use-add-debt.ts`
- `/Users/vincentmukuna/code/owed/src/features/debts/repositories/debt-repository.ts`
- `/Users/vincentmukuna/code/owed/src/lib/mutations/after-debt-domain-change.ts`

## State Ownership

| Data | Owner |
| --- | --- |
| Subscriptions, categories, subscription events | SQLite |
| Notification preference and scheduled notification ids | SQLite or AsyncStorage, depending on scope |
| Query cache and async loading state | TanStack Query |
| App settings such as currency and theme | AsyncStorage + small Zustand store |
| Toasts and ephemeral UI | Small Zustand store |

Never keep the same subscription list in both Zustand and React Query.

## SQLite

Use `expo-sqlite` async APIs and hand-written SQL. Do not add Drizzle for MVP.

Relevant Owed examples:

- `/Users/vincentmukuna/code/owed/src/lib/db/client.ts`
- `/Users/vincentmukuna/code/owed/src/lib/db/migrations/index.ts`
- `/Users/vincentmukuna/code/owed/src/features/debts/repositories/debt-repository.ts`

The foundation migration creates:

- `categories`
- `subscriptions`
- `subscription_events`
- `schema_migrations`

Store facts only. Do not store derived fields such as next renewal date, monthly equivalent, yearly equivalent, total spent estimate, formatted date labels, status labels, or initials.

## Notifications

Reneww MVP should notify users about upcoming charges, but it should not copy Owed's more complex grouped reminder and inbox system.

Foundation already includes `expo-notifications`, `expo-device`, and the `expo-notifications` config plugin. Implementation agents should only need code and schema changes.

Relevant Owed files to simplify from:

- `/Users/vincentmukuna/code/owed/src/features/reminders/lib/notification-permissions.ts`
- `/Users/vincentmukuna/code/owed/src/features/reminders/lib/reminder-scheduler.ts`
- `/Users/vincentmukuna/code/owed/src/features/reminders/lib/notification-service.ts`
- `/Users/vincentmukuna/code/owed/src/features/reminders/lib/reminder-sync.ts`

Use a simple local-notification model:

- Ask for notification permission only when the user enables reminders or accepts the first reminder prompt.
- Schedule one upcoming-charge notification per active subscription.
- Derive the notification trigger from `nextRenewalDate - reminderLeadDays`.
- Default `reminderLeadDays` should be 3.
- Cancel scheduled notifications when a subscription becomes inactive, archived, deleted, or its renewal data changes.
- Resync notification schedules after subscription mutations and app launch.
- Do not build a notification inbox, grouped notifications, read/unread state, or dedup grouping in MVP.

Implementation may use a small `subscription_notifications` table or minimal reminder columns on `subscriptions`. Prefer the smallest shape that can track the platform notification id needed for cancellation.

## Performance

Follow Owed's list posture:

- Use FlashList for unbounded subscription lists.
- List queries should return summary rows, not heavy relation objects.
- Compute aggregates in SQL where it avoids loading unnecessary rows.
- Use one `now` value per mapper batch.
- Use `staleTime: Infinity` for local SQLite reads.
- Invalidate queries only after mutations.

Relevant Owed examples:

- `/Users/vincentmukuna/code/owed/docs/performance.md`
- `/Users/vincentmukuna/code/owed/src/components/debts/debt-list.tsx`
- `/Users/vincentmukuna/code/owed/src/features/debts/lib/debt-list-utils.ts`

## Currency

Subscriptions do not have individual currencies in MVP. The app has one default currency in settings.

Currency preference is persisted in AsyncStorage under the `@renew/` prefix and initialized from OS region when no preference exists.

Changing currency with existing subscriptions should later follow Owed's explicit conversion flow rather than silently changing labels.

Relevant Owed examples:

- `/Users/vincentmukuna/code/owed/src/features/settings/lib/bootstrap-currency.ts`
- `/Users/vincentmukuna/code/owed/src/features/settings/hooks/use-change-currency.ts`
- `/Users/vincentmukuna/code/owed/src/features/settings/components/currency-picker-sheet.tsx`

## Native Builds

This repo starts managed. Use Expo Go first:

```sh
npm start
```

Only run native builds when a feature needs them:

```sh
npx expo run:ios
npx expo run:android
```

Generated native folders are intentionally ignored in the foundation.
