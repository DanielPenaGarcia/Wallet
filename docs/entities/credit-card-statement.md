# Credit Card Statement

`CreditCardStatement` represents a historical closed statement period for a credit account.

It answers how much the bank reported for a concrete period and how much of that closed statement is still unpaid. It does not represent the card's current consumed credit; that remains `accounts.balanceCents`.

## Fields

- `id`: unique statement identifier.
- `accountId`: related credit account identifier.
- `periodStartDate`: first date included in the closed period.
- `periodEndDate`: last date included in the closed period.
- `statementDate`: date the statement closed.
- `paymentDueDate`: due date for that closed statement.
- `statementBalanceCents`: amount reported by the bank at statement close.
- `paidAmountCents`: amount already paid against this statement.
- `createdAt`: creation timestamp.
- `updatedAt`: last update timestamp.

## Rules

- Statements can only belong to accounts with `type = credit`.
- `statementBalanceCents` cannot be negative.
- `paidAmountCents` cannot be negative.
- `paidAmountCents` cannot exceed `statementBalanceCents`.
- `paymentDueDate` must be after `statementDate`.
- `periodStartDate` cannot be after `periodEndDate`.
- A credit account cannot have two statements with the same `statementDate`.
- Creating a statement does not modify `accounts.balanceCents`.
- Editing a statement does not modify `accounts.balanceCents`.
- Editing a statement cannot move it to another account.
- Editing `statementDate` is allowed only when it does not duplicate another statement date for the same account.
- Wallet does not create statements automatically when `statementDay` arrives.

## Derived Values

Outstanding statement balance is not persisted:

```text
outstandingStatementBalanceCents = statementBalanceCents - paidAmountCents
```

Statement status is derived:

- `Pendiente`: `paidAmountCents = 0` and `statementBalanceCents > 0`.
- `Pago parcial`: `0 < paidAmountCents < statementBalanceCents`.
- `Pagado`: `paidAmountCents >= statementBalanceCents`.

## Cycle Dates

Cycle calculations are centralized in `src/lib/modules/credit-card-statements/utils`.

When a configured day does not exist in a month, Wallet uses the month's last real day. For example, day `31` resolves to February 28 in February 2026 and April 30 in April.

The payment due date for a statement is the first valid occurrence of `paymentDueDay` after `statementDate`.

Statement records persist their historical dates. They do not change when `accounts.statementDay` or `accounts.paymentDueDay` changes later.

## Projection

Credit card projection combines:

- `Account.balanceCents`: current consumed credit.
- Latest `CreditCardStatement`: closed-period amount and outstanding balance.
- `InstallmentPurchase`: already-billed MSI, future MSI, and next installment amount.

The normal unbilled estimate is:

```text
estimatedUnbilledNonInstallmentCents =
    account.balanceCents
    - outstandingPreviousStatementCents
    - futureInstallmentBalanceCents
```

Negative results indicate inconsistent captured data. The UI warns and clamps the presented amount to `0`, but the inconsistency remains detectable.

The estimated new statement charges are:

```text
estimatedNewStatementChargesCents =
    presentationUnbilledNonInstallmentCents
    + nextInstallmentsCents
```

The projected base total is:

```text
estimatedNextStatementBaseCents =
    outstandingPreviousStatementCents
    + estimatedNewStatementChargesCents
```

This projection is approximate. It does not include interest, fees, tax, bonuses, bank adjustments, or unregistered charges.

## Server Module

Statement persistence and validation are owned by `src/lib/server/credit-card-statements`.

Client-safe cycle and projection helpers live in `src/lib/modules/credit-card-statements`.
