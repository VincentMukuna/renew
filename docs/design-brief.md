# Design Brief: Reneww MVP v1

## Product Feel

Reneww should match Owed's shipped MVP v1 interface exactly, with only product copy, domain labels, and the primary color changed.

- Calm
- Private
- Minimal
- Useful
- Personal
- Lightweight
- Indie-polished

It should not be a reinterpretation of Owed, a new design system, a bank app, an enterprise dashboard, or a complex budgeting tool.

## Non-Negotiable Owed Parity

Agents must copy Owed's actual code patterns and visual structure wherever a matching surface exists.

- Use `NativeTabs` from `expo-router/unstable-native-tabs`, as Owed does.
- Use Owed's `TabScreen` safe-area wrapper for tab pages.
- Use Owed's header spacing: `paddingTop: 16`, `paddingBottom: 16`, `paddingHorizontal: 20`.
- Use Owed's dashboard hero card with the two translucent circular orbs.
- Use Owed's 2x2 stat-card grid.
- Use Owed's section heading style without decorative underlines.
- Use Owed's floating add button behavior and placement.
- Use Owed's flat row lists with thin row dividers only; do not add section dividers under titles.
- Do not invent alternate cards, search shells, large top padding, or marketing-style empty dashboard layouts.

Primary Owed files:

- `/Users/vincentmukuna/code/owed/src/features/dashboard/screens/home-screen.tsx`
- `/Users/vincentmukuna/code/owed/src/app/(tabs)/_layout.tsx`
- `/Users/vincentmukuna/code/owed/src/components/navigation/tab-screen.tsx`
- `/Users/vincentmukuna/code/owed/src/components/debts/summary-stat-card.tsx`
- `/Users/vincentmukuna/code/owed/src/components/shared/fab-button.tsx`
- `/Users/vincentmukuna/code/owed/src/features/dashboard/components/home-debt-section.tsx`

## Brand Direction

Visible app name: **Reneww**

Technical name: `renew`

Primary color identity: deep indigo / blue. This gives Reneww its own suite color, like Docs and Sheets having different identities inside one family.

## Navigation

MVP navigation uses Owed's native tab treatment with three Reneww tabs:

- Home
- Subscriptions
- Settings

Home gives the quick dashboard. Subscriptions owns the full searchable/filterable ledger. Settings owns currency, categories, data/privacy, and project info.

## Home

Home uses Owed's confident header style:

```txt
RENEWW
Know what renews before it does
```

The top metric must copy Owed's hero card proportions and orb treatment, using Reneww indigo:

- Label: MONTHLY EXPENSES
- Value: app-currency amount
- Helper: Across N active subscriptions

Below it, use Owed's 2x2 `SummaryStatCard` grid for:

- Total Subscribed
- Total Spent
- Yearly Expenses

## Lists

Subscription lists should copy Owed's flat list language:

- Flush rows on the background
- Thin dividers
- Circular icon/initials on the left
- Main text in the middle
- Amount/date aligned right
- Minimal badges only when useful

Avoid heavy shadows, chunky category pills, boxed subscription cards, dense enterprise layouts, section-title underlines, or extra decorative separators.

## Settings

Settings should follow Owed's grouped settings style:

- Preferences
- Categories
- Data & Privacy
- About

Categories are customizable, but the foundation pass only reserves the shell and schema.
