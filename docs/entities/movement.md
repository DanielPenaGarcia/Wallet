# Movement

`Movement` represents a financial operation that actually happened.

It is the domain concept that backs balance changes instead of allowing unrelated modules to mutate balances independently.

## Conceptual Types

- `income`: money entering a destination account.
- `expense`: money leaving a source account.
- `transfer`: money moving between two accounts.
- `credit_purchase`: a purchase made with a credit account.
- `credit_card_payment`: money leaving a real-money account to reduce consumed credit.
- `adjustment`: an explicit one-account correction that preserves traceability.

## Fields

The current client-safe `Movement` shape includes:

- `id`: unique movement identifier.
- `type`: movement type.
- `title`: user-facing movement title.
- `reason`: optional detail for income movements.
- `amount`: monetary amount in minor units.
- `amountCents`: persisted monetary amount in cents.
- `currencyCode`: three-letter currency code.
- `paymentMode`: `cash` or `installments` for expenses when applicable.
- `installmentCount`: number of installments when payment mode is installments.
- `interestFree`: whether an installment expense is interest-free.
- `occurredAt`: date and time when the movement happened.
- `sourceCardId`: origin account/card for expenses and transfers.
- `destinationCardId`: destination account/card for income and transfers.
- `classificationKind`: whether the movement is linked to recurring income, recurring expense, or category.
- `classificationId`: identifier of the selected classification.
- `categoryId`: persisted category reference when the movement is categorizable.
- `recurringExpenseId`: optional recurring expense configuration materialized by the movement.
- `recurringIncomeId`: optional recurring income configuration materialized by the movement.
- `active`: whether the movement is active.
- `registeredAt`: creation timestamp.
- `createdAt`: persisted creation timestamp.
- `updatedAt`: last update timestamp.
- `deletedAt`: deletion timestamp when soft-deleted.

## Balance Responsibility

Future balance-changing workflows should be movement-backed:

- Income increases the destination balance.
- Expense decreases the source balance or increases consumed credit, depending on account type.
- Transfer decreases the source and increases the destination.
- Credit purchase increases consumed credit.
- Credit card payment decreases the payment source balance and decreases consumed credit.
- Adjustment affects exactly one account and must remain explicit. For credit accounts it corrects consumed credit.
- Account balance correction forms create `adjustment` movements instead of writing balances directly.

Historical credit card statements and installment purchases remain explanatory records. They do not replace movements and do not mutate balances by themselves.

Recurring income and recurring expense records remain expected configuration. They do not modify balances until a concrete movement is created and linked to the recurring record.

## Current Scope

The UI has movement components and client-safe types. The server module defines the persistent `movements` table, repository contract, Drizzle adapter, mapper, service-level creation validation, read filters, and atomic balance application when a movement is created.

## Rules

- A movement amount must be positive.
- A movement must have an occurrence timestamp.
- Income requires a destination account.
- Expense and credit purchase require a source account.
- Transfer requires distinct source and destination accounts.
- Credit card payment requires distinct source and destination accounts and is not categorized as a new expense.
- Adjustment requires exactly one affected account.
- Income, expense, and transfer operate on real-money accounts (`personal` or `debit`).
- Credit purchase uses a credit account and increases consumed credit.
- Credit card payment uses a real-money source account and a credit destination account.
- Creating a movement persists the movement and all affected account balance changes in one database transaction.
- Editing a movement first reverses the original impact, validates the replacement against that intermediate state, then applies the new impact in one database transaction.
- Deleting a movement archives it and reverses its original impact in one database transaction.
- Editing or deleting a movement is rejected if the reversal or final state would violate balance invariants.
- A movement cannot leave a real-money balance negative.
- A movement cannot leave consumed credit negative or above the configured credit limit.
- Ordinary credit-affecting movements must occur after the credit account's balance reference date.
- Explicit credit adjustments may occur on the balance reference date, but not before it.
- Expense and credit purchase movements require exactly one classification: category or recurring expense.
- Income movements may reference a recurring income configuration and cannot reference expense categories or recurring expenses.
- Active recurring materializations are unique by recurring configuration, movement type, and effective date to prevent duplicate balance impact from repeated submissions.
- Transfers, credit card payments, and adjustments do not carry category or recurring configuration references.
- Persisted account, category, recurring expense, and recurring income references are verified before creation.
- Soft deletion preserves historical context with `active = false` and `deletedAt`.
