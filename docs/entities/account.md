# Account

`Account` represents a place where money or credit exists in the application.

The current account types are:

- `personal`: cash held outside a bank account.
- `debit`: a bank debit account where available money is real balance.
- `credit`: a credit card or credit line granted by a bank.

## Fields

- `id`: unique account identifier.
- `name`: user-facing name for the account.
- `type`: account type. Supported values are `personal`, `debit`, and `credit`.
- `bankId`: optional bank identifier. Required for `debit` and `credit`, and `null` for `personal`.
- `cardLastFourDigits`: optional last four digits for card-like accounts. Required for debit accounts by the current form rules.
- `cardColor`: optional color used to preview debit and credit cards in the UI.
- `balanceCents`: current balance stored in cents.
- `balanceAsOfDate`: financial reference date for the captured balance.
- `creditLimitCents`: credit limit stored in cents. Applies only to `credit`.
- `statementDay`: recurring monthly statement day for credit cards. Applies only to `credit`.
- `paymentDueDay`: recurring monthly payment due day for credit cards. Applies only to `credit`.
- `isActive`: whether the account is active. Currently used for credit cards.
- `createdAt`: creation timestamp.
- `updatedAt`: last update timestamp.

## Account Adjustments

`accountAdjustments` stores legacy manual balance corrections for personal and debit accounts.

Fields:

- `id`: unique adjustment identifier.
- `accountId`: related account identifier.
- `previousBalanceCents`: balance before the adjustment.
- `newBalanceCents`: balance after the adjustment.
- `differenceCents`: difference between the previous and new balance.
- `reason`: user-facing explanation for the correction.
- `createdAt`: adjustment timestamp.

New balance corrections are represented as explicit `adjustment` movements. Credit card balances are not adjusted through this history, and credit card corrections must be represented by the appropriate purchase or payment movement after the initial balance reference date.

## Derived Values

Credit available is never stored.

It is derived as:

```text
availableCredit = creditLimitCents - balanceCents
```

The UI clamps negative display values to `0`, but validation prevents a credit balance from exceeding the configured credit limit.

The credit usage percentage shown in the account list is also derived:

```text
usagePercentage = balanceCents / creditLimitCents
```

Credit card installment purchases (`installmentPurchases`) and statement records (`creditCardStatements`) can explain parts of the consumed balance, but `balanceCents` remains the persisted current consumed credit. The account module does not reconstruct `balanceCents` from those records.

When installment purchase outstanding amount exceeds `balanceCents`, the UI shows a warning. The condition does not block account usage and does not automatically modify the account balance.

Credit statement cycles and payment due dates are derived from `statementDay` and `paymentDueDay`, using the last real day of the month when a configured day does not exist.

## Rules

- A personal account is automatically ensured by the account service and cannot be deleted.
- Account names must be unique after normalization.
- Debit and credit accounts require an existing bank.
- A bank referenced by any account cannot be deleted from settings.
- Debit accounts require exactly four card digits.
- Debit and credit accounts require a valid card color.
- Debit initial balance cannot be negative.
- Debit and credit accounts require a balance reference date.
- Credit limit must be greater than `0`.
- Credit balance cannot be negative.
- Credit balance cannot exceed credit limit.
- Credit statement and payment due days must be recurring month days from `1` to `31`.
- Credit available must remain derivable and is not persisted.
- Creating movements changes `balanceCents` directly in the same transaction that persists the movement.
- Post-start balance corrections must be explicit adjustment movements, not direct account writes.
- Credit movements that affect balance must occur after the credit account's `balanceAsOfDate`.
- Historical credit installment purchases do not mutate `balanceCents` when created, edited, or deleted.
- Historical credit card statements do not mutate `balanceCents` when created.
- Account `statementDay` and `paymentDueDay` can be used to prefill statement dates, but persisted statement dates remain historical and do not change if account configuration changes later.

## Server Module

Account business rules are owned by `src/lib/server/accounts`.

The service ensures the personal account exists, validates create and update inputs, exposes credit-card-only reads for the detail page, enforces name uniqueness, blocks deletion of the personal account, preserves a financial reference date for the current balance, and delegates persistence through the account repository contract. It no longer exposes a direct balance-adjustment write path.
