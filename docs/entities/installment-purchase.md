# Installment Purchase

`InstallmentPurchase` represents a historical months-without-interest purchase associated with a credit account.

The entity explains credit card balance composition. It does not create movements and does not mutate the related account balance.

## Fields

- `id`: unique installment purchase identifier.
- `accountId`: related credit account identifier.
- `description`: user-facing purchase description.
- `purchaseDate`: purchase date in `YYYY-MM-DD` format.
- `originalAmountCents`: original purchase amount in cents.
- `installmentAmountCents`: regular installment amount in cents.
- `totalInstallments`: total installment count.
- `billedInstallments`: installments already billed by statement cut.
- `paidInstallments`: installments already paid.
- `createdAt`: creation timestamp.
- `updatedAt`: last update timestamp.

## Rules

- Installment purchases can only belong to accounts with `type = credit`.
- `description` is required and has a maximum length of 160 characters.
- `purchaseDate` must be a valid ISO calendar date.
- `originalAmountCents`, `installmentAmountCents`, and `totalInstallments` must be greater than `0`.
- `billedInstallments` and `paidInstallments` cannot be negative.
- Counts must satisfy `0 <= paidInstallments <= billedInstallments <= totalInstallments`.
- The regular installment amount cannot make the final installment negative or zero.
- Updating or deleting a purchase must target a purchase that belongs to the credit account being edited.
- Create, update, and delete operations do not modify `accounts.balanceCents`.

## Derived Values

The final installment absorbs any rounding difference:

```text
lastInstallment = originalAmountCents - installmentAmountCents * (totalInstallments - 1)
```

Derived amounts are calculated at read time:

- `paidAmountCents`: sum of installments from `1` through `paidInstallments`.
- `unpaidBilledAmountCents`: sum from `paidInstallments + 1` through `billedInstallments`.
- `futureAmountCents`: sum from `billedInstallments + 1` through `totalInstallments`.
- `outstandingAmountCents`: `unpaidBilledAmountCents + futureAmountCents`.
- `nextInstallmentAmountCents`: next installment after `billedInstallments`, or `0` when fully billed.

The module does not auto-advance `billedInstallments` from dates. The user updates billed and paid counters explicitly.

For credit card projections:

- `futureAmountCents` represents MSI debt that already consumes credit but has not entered a closed statement.
- `nextInstallmentAmountCents` contributes to the estimated new charges for the next statement.
- `unpaidBilledAmountCents` may already be part of the latest closed statement and must not be subtracted twice from account balance projections.

## Server Module

Installment purchase business rules are owned by `src/lib/server/installment-purchases`.

Client-safe types and calculation helpers live in `src/lib/modules/installment-purchases`.
