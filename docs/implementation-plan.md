# Reneww MVP Implementation Plan

This plan is split into slices that future agents can pick up independently. Keep each slice small enough that `main` stays runnable.

## Design Source Rule

Every implementation slice must take design choices from Owed's shipped MVP v1 code. Do not reinterpret the product agent brief into new UI. Use Reneww copy, subscription domain labels, and the Reneww indigo token, but copy Owed's spacing, typography, native tabs, cards, rows, forms, sheets, headers, FAB, empty states, skeletons, and settings grouping wherever an equivalent Owed surface exists.

Core design files to keep open while implementing:

- `/Users/vincentmukuna/code/owed/src/features/dashboard/screens/home-screen.tsx`
- `/Users/vincentmukuna/code/owed/src/app/(tabs)/_layout.tsx`
- `/Users/vincentmukuna/code/owed/src/components/navigation/tab-screen.tsx`
- `/Users/vincentmukuna/code/owed/src/components/debts/debt-card.tsx`
- `/Users/vincentmukuna/code/owed/src/components/debts/debt-list.tsx`
- `/Users/vincentmukuna/code/owed/src/components/debts/summary-stat-card.tsx`
- `/Users/vincentmukuna/code/owed/src/components/shared/fab-button.tsx`
- `/Users/vincentmukuna/code/owed/src/features/settings/screens/settings-screen.tsx`
- `/Users/vincentmukuna/code/owed/src/styles/themes.ts`

## 1. Foundation Shell

Status: implemented in this repo foundation.

Scope:

- Managed Expo app with Expo Router.
- Owed-style `src/app` route shells and feature-owned screens.
- Owed-style native liquid-glass tabs: Home, Subscriptions, Settings.
- Unistyles theme with Reneww indigo identity.
- QueryClientProvider and app bootstrap gate.
- Expo notification dependencies and config plugin installed for the later simple reminders slice.
- SQLite client and migration runner.
- Migration `001` with categories, subscriptions, subscription events, and schema migrations.
- Seeded default categories.
- AsyncStorage-backed settings foundation for default currency and theme preference.
- Empty Home, Subscriptions, Add Subscription, and Settings screens.
- Docs with product, design, architecture, and feature slices.

Design parity requirements:

- Home must stay structurally matched to `/Users/vincentmukuna/code/owed/src/features/dashboard/screens/home-screen.tsx`.
- Tab layout must stay structurally matched to `/Users/vincentmukuna/code/owed/src/app/(tabs)/_layout.tsx`.
- Do not replace Owed's hero, stat grid, FAB, tab shell, or section heading patterns with new interpretations.
- No decorative underlines under dashboard section headings.
- No large artificial top padding on tab pages.

Out of scope:

- Real subscription CRUD.
- Search/filter behavior.
- Category management UI.
- Notification scheduling logic. Simple upcoming-charge notifications are MVP scope, but implementation is a later slice.
- Native prebuild.

## 2. Subscription Capture

Goal: make the first real domain write path work end to end.

Read first:

- `/Users/vincentmukuna/code/owed/src/features/debts/screens/add-debt-screen.tsx`
- `/Users/vincentmukuna/code/owed/src/features/debts/repositories/debt-repository.ts`
- `/Users/vincentmukuna/code/owed/src/features/debts/hooks/use-add-debt.ts`
- `/Users/vincentmukuna/code/owed/src/features/debts/schemas/debt-schemas.ts`
- `/Users/vincentmukuna/code/owed/src/features/debts/components/due-date-picker-modal.tsx`
- `/Users/vincentmukuna/code/owed/src/components/navigation/header-save-button.tsx`
- `/Users/vincentmukuna/code/owed/src/components/ui/form-field.tsx`
- `/Users/vincentmukuna/code/owed/src/components/ui/input.tsx`
- `/Users/vincentmukuna/code/owed/src/components/ui/button.tsx`

Design source:

- Copy Owed's add/edit form rhythm, modal header save behavior, field spacing, picker/sheet treatment, and validation/error tone.
- Do not create a new form visual system for subscription capture.

Build:

- `subscriptionRepository.create(input)` with direct SQLite writes.
- `categoryRepository.list()` already exists; use it in the form.
- `CreateSubscriptionInput` and Zod schema.
- React Hook Form add-subscription screen.
- Cost input stored as integer whole currency units.
- Date picker for start date.
- Recurrence selector using the fixed MVP recurrence set.
- Active switch.
- `subscription_events` row on create.
- `useAddSubscription` mutation.
- Query invalidation helper for subscription domain changes.
- Toast success/error.

Acceptance:

- A subscription can be added.
- It persists after app restart.
- No subscription-level currency field exists.
- Hook calls repository directly.

## 3. Ledger Reads And Home Metrics

Goal: turn the empty dashboard and ledger into real persisted views.

Read first:

- `/Users/vincentmukuna/code/owed/src/features/debts/repositories/debt-repository.ts`
- `/Users/vincentmukuna/code/owed/src/features/debts/hooks/use-debts.ts`
- `/Users/vincentmukuna/code/owed/src/features/dashboard/screens/home-screen.tsx`
- `/Users/vincentmukuna/code/owed/src/features/dashboard/components/home-debt-section.tsx`
- `/Users/vincentmukuna/code/owed/src/components/debts/summary-stat-card.tsx`
- `/Users/vincentmukuna/code/owed/src/components/debts/debt-card.tsx`
- `/Users/vincentmukuna/code/owed/src/features/debts/lib/mappers.ts`
- `/Users/vincentmukuna/code/owed/src/features/debts/lib/format-dates.ts`

Design source:

- Home hero, stats grid, section headings, FAB, and list rows must stay structurally matched to Owed.
- Replace only copy and metrics: debts become subscriptions, due dates become renewal dates, paid/owed amounts become subscription expense metrics.

Build:

- `subscriptionRepository.listSummaries()`.
- `subscriptionRepository.getStats(now)`.
- Pure recurrence math helpers:
  - monthly equivalent
  - yearly equivalent
  - next renewal date
  - completed billing cycles
  - total spent estimate
- View model mappers for Home and list rows.
- `useSubscriptions`, `useSubscriptionStats`, and shared `load*` functions.
- Home hero card and metric cards from SQLite data.
- Due Soon section for the next 7 days.
- Active section for active subscriptions not due soon.
- Subscriptions tab full list.

Acceptance:

- Active metrics exclude inactive subscriptions.
- Total spent is visibly treated as an estimate.
- Due soon uses the next renewal date derived from start date and recurrence.
- Lists remain flat, divided rows rather than cards.

## 4. Subscription Detail And Activity State

Goal: let users inspect and change a subscription without deleting history.

Read first:

- `/Users/vincentmukuna/code/owed/src/features/debts/screens/debt-detail-screen.tsx`
- `/Users/vincentmukuna/code/owed/src/features/debts/screens/record-payment-screen.tsx`
- `/Users/vincentmukuna/code/owed/src/features/people/screens/edit-person-screen.tsx`
- `/Users/vincentmukuna/code/owed/src/features/debts/hooks/use-debt.ts`
- `/Users/vincentmukuna/code/owed/src/features/debts/repositories/debt-repository.ts`
- `/Users/vincentmukuna/code/owed/src/lib/mutations/after-debt-domain-change.ts`
- `/Users/vincentmukuna/code/owed/src/components/ui/badge.tsx`
- `/Users/vincentmukuna/code/owed/src/components/ui/card.tsx`

Design source:

- Copy Owed's detail-screen hierarchy, modal edit flows, badges, cards, and row spacing.
- Keep subscription detail personal and lightweight; do not make it an enterprise analytics page.

Build:

- Subscription detail route.
- Detail view with plan, cost, category, recurrence, start date, next renewal, and estimated spend.
- Toggle active/inactive.
- Edit subscription modal or screen.
- Repository update methods.
- Events for created, updated, deactivated, and reactivated.
- Query invalidation after updates.

Acceptance:

- Inactive subscriptions stay visible in the full ledger.
- Inactive subscriptions are excluded from active monthly/yearly metrics.
- Detail route loads one subscription by id.

## 5. Search, Filters, And List Scale

Goal: make the Subscriptions tab useful as the long-term ledger.

Read first:

- `/Users/vincentmukuna/code/owed/docs/performance.md`
- `/Users/vincentmukuna/code/owed/src/components/debts/debt-list.tsx`
- `/Users/vincentmukuna/code/owed/src/components/debts/debt-search-bar.tsx`
- `/Users/vincentmukuna/code/owed/src/components/debts/debt-card.tsx`
- `/Users/vincentmukuna/code/owed/src/features/debts/lib/debt-list-utils.ts`
- `/Users/vincentmukuna/code/owed/src/features/debts/screens/debts-screen.tsx`

Design source:

- Copy Owed's search bar, filter tabs, flat list rows, FlashList wrapper, empty states, and scroll-to-top behavior.
- Do not use boxed subscription cards for ledger rows.

Build:

- Search by name and plan.
- Filters: All, Active, Inactive, Due Soon.
- Optional category filter.
- FlashList for the full ledger.
- Single-pass list utility for filtering/counts.
- Scroll-to-top on filter change.

Acceptance:

- Hundreds of subscriptions remain scrollable.
- No chained filter/reduce logic in JSX.
- Empty states are calm and specific.

## 6. Category Management

Goal: let users customize the seeded categories.

Read first:

- `/Users/vincentmukuna/code/owed/src/features/debts/repositories/person-repository.ts`
- `/Users/vincentmukuna/code/owed/src/features/people/screens/add-person-screen.tsx`
- `/Users/vincentmukuna/code/owed/src/features/people/screens/edit-person-screen.tsx`
- `/Users/vincentmukuna/code/owed/src/features/people/hooks/use-add-person.ts`
- `/Users/vincentmukuna/code/owed/src/features/people/hooks/use-update-person.ts`
- `/Users/vincentmukuna/code/owed/src/features/settings/screens/settings-screen.tsx`

Design source:

- Category management should feel like Owed's settings and people add/edit flows combined.
- Use Owed grouped settings rows for entry points and Owed modal form styling for add/rename.

Build:

- Categories settings screen.
- Add category.
- Rename category.
- Archive category when unused, or block/archive with reassignment when used.
- Repository methods for category mutations.
- Invalidate category and subscription queries where needed.

Acceptance:

- Existing subscriptions keep valid category references.
- Category order is stable.
- The default categories are editable as local user data, not hardcoded UI constants.

## 7. Data And Privacy Tools

Goal: give the local-first app a responsible settings surface.

Read first:

- `/Users/vincentmukuna/code/owed/src/features/settings/dev/reset-database.ts`
- `/Users/vincentmukuna/code/owed/src/features/settings/dev/seed-debts.ts`
- `/Users/vincentmukuna/code/owed/src/features/settings/dev/dev-tools-section.tsx`
- `/Users/vincentmukuna/code/owed/src/features/settings/screens/settings-screen.tsx`
- `/Users/vincentmukuna/code/owed/src/components/ui/empty-state.tsx`

Design source:

- Data/privacy surfaces should use Owed's settings section/card/row language.
- Destructive actions should follow Owed's calm settings tone and require confirmation.

Build:

- Reset local database in dev or confirmed production flow.
- Export plan decision: document only unless required.
- Privacy copy that states data stays on device.
- Optional seed data dev tool for performance testing.

Acceptance:

- Destructive actions require confirmation.
- Dev-only tools are gated with `__DEV__`.

## 8. Simple Upcoming-Charge Notifications

Goal: notify users before upcoming charges so they can cancel or prepare, without building Owed's complex grouped reminder system.

Read first, then deliberately simplify:

- `/Users/vincentmukuna/code/owed/src/features/reminders/lib/notification-permissions.ts`
- `/Users/vincentmukuna/code/owed/src/features/reminders/lib/notification-service.ts`
- `/Users/vincentmukuna/code/owed/src/features/reminders/lib/reminder-scheduler.ts`
- `/Users/vincentmukuna/code/owed/src/features/reminders/lib/reminder-sync.ts`
- `/Users/vincentmukuna/code/owed/src/features/reminders/repositories/reminder-repository.ts`
- `/Users/vincentmukuna/code/owed/src/features/reminders/components/bell-badge-button.tsx`
- `/Users/vincentmukuna/code/owed/src/features/settings/screens/settings-screen.tsx`

Design source:

- Notification settings should copy Owed's settings rows and permission language style.
- Keep the Home bell visually Owed-like, but do not implement Owed's inbox/grouping/read-state system.

Build:

- Use the already-installed `expo-notifications` and `expo-device` packages plus the existing `expo-notifications` config plugin.
- Add minimal persistence for scheduled notification ids:
  - either `subscription_notifications(subscription_id, notification_id, scheduled_for, created_at, updated_at)`, or
  - reminder columns on `subscriptions` if the implementation stays simpler.
- Add app-level reminder settings:
  - reminders enabled/disabled
  - default lead time, initially 3 days before renewal
- Ask permission only when reminders are enabled.
- Schedule one notification per active subscription for its next upcoming charge.
- Cancel and reschedule after subscription create/update/deactivate/reactivate/archive.
- Resync schedules on app launch.
- Keep copy practical, for example: `Netflix renews in 3 days` and the app-currency amount when available.

Acceptance:

- Active subscriptions with an upcoming renewal can schedule a local notification.
- Inactive subscriptions do not schedule notifications.
- Updating cost, recurrence, start date, or active state cancels stale schedules.
- No notification inbox, grouping, read state, or dedup feed is introduced.

## 9. Polish And Release Readiness

Goal: turn the MVP into a product-quality first release.

Read first:

- `/Users/vincentmukuna/code/owed/app.json`
- `/Users/vincentmukuna/code/owed/src/styles/themes.ts`
- `/Users/vincentmukuna/code/owed/src/components/ui/empty-state.tsx`
- `/Users/vincentmukuna/code/owed/src/components/ui/screen-skeletons.tsx`
- `/Users/vincentmukuna/code/owed/assets/expo.icon/icon.json`
- `/Users/vincentmukuna/code/owed/assets/images/icon.png`

Design source:

- Polish means Reneww should look like a recolored Owed sibling, not a redesigned app.
- Branded assets can differ, but layout, density, and UI behavior should remain Owed-derived.

Build:

- Branded Reneww app icon and splash assets.
- Loading/error/empty states across screens.
- Accessibility labels for icon buttons and row actions.
- Manual QA checklist.
- `npm run lint` clean.
- Expo Go smoke test.
- Native build documentation updated only when needed.

Acceptance:

- App launches cleanly.
- Empty, loading, and error states fit Owed's tone.
- No native folders are committed unless a later feature explicitly requires them.
