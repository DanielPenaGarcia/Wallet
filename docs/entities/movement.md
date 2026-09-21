# Movement

`Movement` represents a financial operation that actually happened.

It is the domain concept that should eventually back balance changes instead of allowing unrelated modules to mutate balances independently.

## Conceptual Types

- `income`: money entering a destination account.
- `expense`: money leaving a source account.
- `transfer`: money moving between two accounts.

## Fields

The current client-safe `Movement` shape includes:

- `id`: unique movement identifier.
- `type`: movement type. Supported values are `income`, `expense`, and `transfer`.
- `title`: user-facing movement title.
- `reason`: optional detail for income movements.
- `amount`: monetary amount in minor units.
- `currencyCode`: three-letter currency code.
- `paymentMode`: `cash` or `installments` for expenses when applicable.
- `installmentCount`: number of installments when payment mode is installments.
- `interestFree`: whether an installment expense is interest-free.
- `occurredAt`: date and time when the movement happened.
- `sourceCardId`: origin account/card for expenses and transfers.
- `destinationCardId`: destination account/card for income and transfers.
- `classificationKind`: whether an expense is classified by recurring expense or category.
- `classificationId`: identifier of the selected classification.
- `active`: whether the movement is active.
- `registeredAt`: creation timestamp.
- `updatedAt`: last update timestamp.
- `deletedAt`: deletion timestamp when soft-deleted.

## Balance Responsibility

Future balance-changing workflows should be movement-backed:

- Income increases the destination balance.
- Expense decreases the source balance or increases consumed credit, depending on account type.
- Transfer decreases the source and increases the destination.

Historical credit card statements and installment purchases remain explanatory records. They do not replace movements and do not mutate balances by themselves.

## Current Scope

The UI already has movement components and client-safe types. Server-side persistence and balance mutation rules should be completed before new modules start changing account balances directly.

## Rules

- A movement amount must be positive.
- A movement must have an occurrence timestamp.
- Income requires a destination account.
- Expense requires a source account and classification.
- Transfer requires distinct source and destination accounts.
- Soft deletion should preserve historical context.
