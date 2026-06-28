# PRD: Reneww Payment Methods Feature

**Status:** Documented — not in MVP scope; implement after core subscription tracking ships  
**Scope:** Optional labels for how subscriptions are paid (no sensitive payment data)  
**Related docs**

| Document | Role |
| --- | --- |
| [prd.md](./prd.md) | Reneww MVP product requirements |
| [design-brief.md](./design-brief.md) | Visual direction and screen behavior |
| [architecture.md](./architecture.md) | Technical posture inherited from Owed |

---

## 1. Feature Summary

Payment Methods is a future Reneww feature that lets users label how each subscription is paid.

The feature helps users answer:

* Which card, wallet, account, or billing platform is used for this subscription?
* Which subscriptions are tied to a specific payment method?
* Does this subscription have a backup payment method?
* What subscriptions would be affected if I stop using a certain payment method?

This feature should remain lightweight and privacy-safe. Reneww should not store sensitive payment information.

## 2. Feature Positioning

Payment Methods should feel like a simple memory layer, not a financial vault.

The user is not storing card details. They are only saving human-readable labels such as:

* Equity Card
* KCB Card
* M-Pesa
* PayPal
* Apple Billing
* Google Play
* Business Card
* Personal Card

Core promise:

> Remember how each subscription is paid.

## 3. Problem

Many users pay for subscriptions using different payment methods.

Examples:

* One card for business tools
* Another card for entertainment
* M-Pesa for local services
* PayPal for international tools
* Apple Billing for iOS subscriptions
* Google Play for Android subscriptions

Over time, users forget:

* Which subscription uses which card
* Which subscriptions are tied to an old payment method
* Which subscriptions may fail if a card/account is inactive
* Which subscriptions have a backup payment method
* Whether a subscription is personal or business-related based on payment method

This causes confusion, failed payments, surprise charges, and difficulty managing recurring expenses.

## 4. Goals

### Product Goals

* Let users create simple payment method labels.
* Let users assign a primary payment method to a subscription.
* Let users optionally assign a backup payment method to a subscription.
* Let users view all subscriptions attached to a payment method.
* Preserve Reneww’s local-first, privacy-safe positioning.
* Keep the feature optional and out of the MVP’s core add-subscription flow unless the user chooses to use it.

### User Goals

Users should be able to:

* Know how each subscription is paid.
* See all subscriptions tied to a specific payment method.
* Label subscriptions by payment method without storing sensitive payment details.
* Keep business and personal subscriptions easier to separate.
* Remember backup payment setups where applicable.

## 5. Non-Goals

This feature should not include:

* Full card numbers
* CVV
* PINs
* Expiry dates
* Bank account numbers
* Screenshots of cards
* Automatic payment verification
* Bank integrations
* Payment processing
* Transaction history
* Automatic failed-payment detection
* Secure wallet functionality
* PCI-style card storage
* Payment method recommendations

Reneww should explicitly avoid becoming a place where users store sensitive payment data.

## 6. User Stories

### Create Payment Method

As a user, I want to create a simple payment method label so that I can remember how subscriptions are paid.

Example:

> Equity Card  
> Type: Card

### Assign Primary Payment Method

As a user, I want to assign a payment method to a subscription so that I know how the subscription is paid.

Example:

> ChatGPT is paid using Equity Card.

### Assign Backup Payment Method

As a user, I want to optionally assign a backup payment method so that I remember if a subscription has a fallback payment method.

Example:

> Netflix primary: KCB Card  
> Backup: M-Pesa

### View Subscriptions by Payment Method

As a user, I want to open a payment method and see all subscriptions attached to it.

Example:

> Business Card  
> 6 active subscriptions  
> KES 9,400 monthly

### Update Payment Method

As a user, I want to rename or change the type of a payment method if my labels change.

### Remove Payment Method

As a user, I want to delete a payment method if I no longer use it.

If subscriptions are attached to it, Reneww should ask what to do before removing it.

## 7. Payment Method Fields

When creating a payment method, the user should only enter:

1. Name
2. Type

No sensitive details.

### Name

A user-defined label.

Examples:

* Equity Card
* KCB Card
* M-Pesa
* PayPal
* Apple Billing
* Google Play
* Personal Card
* Business Card
* Family Card

### Type

A simple category describing the payment method.

Supported types:

* Card
* Mobile Money
* Wallet
* Bank
* App Store Billing
* Play Store Billing
* Other

Type should help visually organize payment methods without requiring extra details.

## 8. Subscription Assignment

A subscription can optionally have:

* Primary Payment Method
* Backup Payment Method

These fields should be optional.

If no payment method is selected, the subscription should continue working normally.

### Primary Payment Method

This represents how the user expects the subscription to be paid.

Example:

> Spotify → Equity Card

### Backup Payment Method

This represents a fallback payment method the user wants to remember.

Example:

> Netflix → Primary: KCB Card, Backup: M-Pesa

Backup payment method should not imply Reneww has verified that the backup exists. It is only a user-provided note.

## 9. Feature Entry Points

### Settings

Add:

> Payment Methods

Location:

Settings → Preferences or Settings → Organization

This opens the Payment Methods screen.

### Subscription Create/Edit

Add optional payment method fields.

Recommended placement:

After Activity or near the bottom of the form.

Fields:

* Primary Payment Method
* Backup Payment Method

These should be optional picker rows.

The main subscription creation flow should still feel simple.

### Subscription Detail

Add a Payment section.

Example:

```txt
Payment

Primary
Equity Card

Backup
M-Pesa
```

If none is selected:

```txt
Payment

No payment method set.
```

CTA:

> Add payment method

## 10. Payment Methods Screen

### Purpose

Show all saved payment methods.

### Screen Title

> Payment Methods

### Subtitle

> Label how your subscriptions are paid.

### Empty State

Title:

> No payment methods yet.

Body:

> Add simple labels like “Equity Card”, “M-Pesa”, or “PayPal” to remember how subscriptions are paid.

CTA:

> Add payment method

### List Row

Each row should show:

* Payment method name
* Type
* Number of linked subscriptions
* Optional total monthly amount linked to it

Example:

```txt
Equity Card
Card · 5 subscriptions

KES 6,400 monthly
```

Another example:

```txt
M-Pesa
Mobile Money · 2 subscriptions

KES 1,200 monthly
```

Rows should use Reneww’s flat list style:

* No heavy cards
* Thin dividers
* Clean typography
* Small icon or initials on the left
* Right-aligned summary where useful

## 11. Add Payment Method Screen

### Fields

Only include:

1. Name
2. Type

### Defaults

* Type: Card or Other

### CTA

Primary:

> Save payment method

Secondary:

> Cancel

### Helper Copy

Below the form or in an info note:

> Reneww only stores the name and type you provide. Do not enter full card numbers, CVVs, PINs, account numbers, or other sensitive payment details.

## 12. Payment Method Detail Screen

### Purpose

Show a specific payment method and the subscriptions attached to it.

### Header

Show:

* Payment method name
* Type

Example:

```txt
Equity Card
Card
```

### Summary

Show:

* Active subscriptions using this method
* Monthly amount linked to this method
* Yearly amount linked to this method

Example:

```txt
5 active subscriptions
KES 6,400 monthly
KES 76,800 yearly
```

### Subscription List

Show all subscriptions where this payment method is used as:

* Primary payment method
* Backup payment method

Separate sections are recommended:

```txt
PRIMARY
ChatGPT
Spotify
Google Workspace

BACKUP
Netflix
iCloud
```

Each subscription row should use the standard Reneww flat subscription row.

Tapping a subscription opens its detail screen.

### Actions

* Edit payment method
* Delete payment method

## 13. Delete Behavior

If a payment method has no subscriptions linked:

* Allow delete after confirmation.

Confirmation copy:

> Delete this payment method?

If a payment method has linked subscriptions:

Warn the user:

> This payment method is used by 5 subscriptions. Deleting it will remove it from those subscriptions.

Actions:

* Cancel
* Delete anyway

Optional future behavior:

* Replace with another payment method

For the first version, “Delete anyway” is acceptable as long as the warning is clear.

## 14. Subscription List Display

Payment method should not clutter the main subscription list.

Recommended behavior:

* Do not show payment method on every row by default.
* Show payment method on subscription detail.
* Optionally show payment method on the full Subscriptions screen if space allows.

If shown in a row, use subtle metadata:

```txt
ChatGPT
Productivity · Plus · Equity Card

KES 2,600
Monthly · Tomorrow
```

Avoid adding large badges or extra icons that make the row feel busy.

## 15. Filtering

Optional but useful:

On the Subscriptions screen, allow filtering by payment method.

Example filter:

> Payment Method: Equity Card

This helps users quickly answer:

> What uses this card?

This can be added after the basic feature is working.

## 16. Privacy and Trust

Payment Methods must reinforce Reneww’s privacy promise.

Suggested copy:

> Payment Methods are simple labels. Reneww does not store card numbers, CVVs, PINs, bank logins, or account numbers.

This copy should appear:

* On the Add Payment Method screen
* In Settings → Payment Methods empty/info state
* Possibly in the privacy section

## 17. UX Principles

Payment Methods should be:

* Optional
* Lightweight
* Non-sensitive
* Easy to edit
* Easy to remove
* Consistent with Reneww’s flat list UI
* Visually quiet unless the user is actively managing payment methods

Avoid making it feel like a banking feature.

This is a memory feature, not a payment feature.

## 18. Suggested Navigation Placement

Settings:

```txt
Settings
- Preferences
  - App currency
  - Brand color
  - Manage categories
  - Payment methods
```

Subscription Detail:

```txt
Subscription Detail
- Summary
- Renewal
- Payment
- Actions
```

Create/Edit Subscription:

```txt
Basic Details
- Name
- Plan Name
- Category
- Cost
- Recurrence
- Start Date
- Activity

Optional
- Primary Payment Method
- Backup Payment Method
```

The optional section can be visually simple. Do not overcomplicate the form.

## 19. MVP Scope for This Feature

### Must Have

* Add payment method
* Edit payment method
* Delete payment method
* Payment method name
* Payment method type
* Assign primary payment method to subscription
* Assign backup payment method to subscription
* Show payment method on subscription detail
* Show list of subscriptions attached to a payment method
* Privacy copy explaining no sensitive details are stored

### Should Have

* Monthly amount linked to each payment method
* Yearly amount linked to each payment method
* Subscription count per payment method
* Filter subscriptions by payment method

### Could Have Later

* Replace payment method across multiple subscriptions
* Payment method icons
* Group personal vs business methods
* Payment method archive/inactive state
* Expiry reminders if the user later decides to store non-sensitive expiry month/year
* Payment method spending breakdown chart

### Won’t Have

* Full card numbers
* Last 4 digits
* CVV
* Expiry date in first version
* Bank connection
* Payment processing
* Transaction sync
* Automatic payment failure detection

## 20. Success Criteria

The feature is successful if:

* Users can create payment method labels without entering sensitive details.
* Users can assign payment methods to subscriptions.
* Users can see how a subscription is paid.
* Users can see all subscriptions attached to one payment method.
* The feature does not make Reneww feel like a banking app.
* The UI remains clean, modern, and consistent with the rest of Reneww.
* The feature remains optional and does not slow down the basic subscription tracking workflow.
