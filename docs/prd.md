# PRD: Reneww MVP v1

## Product Summary

Reneww is a private, local-first subscription tracker that helps users remember what they are subscribed to, how much each subscription costs, when it renews, and whether it is active.

Core promise:

> Know what renews before it does.

Reneww is manual by design. It does not connect to banks, parse emails, scan receipts, or automatically detect subscriptions.

## Target User

Reneww is for freelancers, developers, students, creators, young professionals, small business owners, and anyone managing recurring services such as Netflix, Spotify, ChatGPT, iCloud, Google Workspace, Notion, domains, hosting, VPNs, gyms, and productivity tools.

## MVP Goals

- Add subscriptions quickly with only important details.
- Show spending metrics on Home.
- Surface active subscriptions and subscriptions due soon.
- Send local reminders for upcoming charges so the user can cancel or prepare.
- Allow subscriptions to be marked active or inactive.
- Organize subscriptions by customizable categories.
- Use one app-level currency across the whole app.
- Keep all data local-first, private, and offline.
- Reuse Owed's UX language and technical posture.

## MVP Non-Goals

- No bank account connection.
- No automatic subscription detection.
- No email, receipt, M-Pesa, or AI parsing.
- No multi-currency subscription entry.
- No custom recurrence intervals.
- No complex budgeting or advanced analytics.
- No account system or cloud sync.
- No complex notification inbox, grouping, dedup feed, or Owed-style reminder system.

## Required Subscription Fields

- Name
- Category
- Plan name
- Cost
- Start date
- Recurrence
- Active/inactive switch

Notification behavior:

- MVP should support simple local notifications for upcoming charges.
- The reminder should be based on the derived next renewal date.
- The default reminder window should be 3 days before renewal unless changed later.
- Inactive subscriptions should not schedule notifications.
- The app does not need a notification inbox for MVP.

Supported recurrence options:

- Weekly
- Bi-weekly
- Monthly
- Bi-monthly
- Quarterly
- Yearly
- Bi-yearly
- Every 3 years

## Home Metrics

Home should show:

- Total Subscribed
- Monthly Expenses
- Total Spent
- Yearly Expenses

`Total Spent` is an estimate derived from start date, recurrence, cost, and today. It should be labeled as an estimate in UI helper copy when implemented.

## Categories

Default categories:

- Productivity
- Wellness
- Business
- Finance
- Entertainment
- Utilities
- Cloud & Storage
- Education
- Shopping
- Other

Categories are domain data in SQLite, not plain strings or AsyncStorage preferences.
