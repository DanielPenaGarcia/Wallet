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
- `creditLimitCents`: credit limit stored in cents. Applies only to `credit`.
- `statementDay`: recurring monthly statement day for credit cards. Applies only to `credit`.
- `paymentDueDay`: recurring monthly payment due day for credit cards. Applies only to `credit`.
- `isActive`: whether the account is active. Currently used for credit cards.
- `createdAt`: creation timestamp.
- `updatedAt`: last update timestamp.

## Account Adjustments

`accountAdjustments` stores manual balance corrections for personal and debit accounts.

Fields:

- `id`: unique adjustment identifier.
- `accountId`: related account identifier.
- `previousBalanceCents`: balance before the adjustment.
- `newBalanceCents`: balance after the adjustment.
- `differenceCents`: difference between the previous and new balance.
- `reason`: user-facing explanation for the correction.
- `createdAt`: adjustment timestamp.

Credit card balances are not adjusted through this history. In the current stage, a credit card balance is edited from the card configuration itself.

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

## Rules

- A personal account is automatically ensured by the account service and cannot be deleted.
- Account names must be unique after normalization.
- Debit and credit accounts require an existing bank.
- Debit accounts require exactly four card digits.
- Debit and credit accounts require a valid card color.
- Debit initial balance cannot be negative.
- Credit limit must be greater than `0`.
- Credit balance cannot be negative.
- Credit balance cannot exceed credit limit.
- Credit statement and payment due days must be recurring month days from `1` to `31`.
- Credit available must remain derivable and is not persisted.

## Server Module

Account business rules are owned by `src/lib/server/accounts`.

The service ensures the personal account exists, validates create and update inputs, enforces name uniqueness, blocks deletion of the personal account, prevents credit balance changes through adjustment history, and delegates persistence through the account repository contract.

