# Recurring Expense

`RecurringExpense` represents an obligation expected to be paid repeatedly.

## Fields

- `id`: unique recurring expense identifier.
- `name`: user-facing expense name.
- `categoryId`: related category identifier.
- `amountCents`: expected amount stored as an integer number of cents.
- `amountKind`: whether the amount is `fixed` or `estimated`.
- `frequency`: supported values are `daily`, `weekly`, `semimonthly`, `monthly`, `yearly`, and `custom`.
- `customIntervalCount`: interval count for custom recurrence.
- `customIntervalUnit`: interval unit for custom recurrence. Supported values are `days`, `weeks`, `months`, and `years`.
- `paymentSchedule`: JSON configuration for the expected payment date according to the frequency.
- `statementDay`: optional recurring statement or cut day.
- `lastPaidAt`: optional last paid date in `YYYY-MM-DD` format.
- `isActive`: whether the expense is currently active.
- `createdAt`: creation timestamp.
- `updatedAt`: last update timestamp.

## Payment Schedule

The payment schedule describes when the expense is expected to be due.

- `daily`: no additional payment day is required.
- `weekly`: stores the weekday when payment is expected.
- `semimonthly`: stores the first payment day and the second payment day, which may be `last`.
- `monthly`: stores the monthly payment day, which may be `last`.
- `yearly`: stores month and day, where day may be `last`.
- `custom`: uses `customIntervalCount` and `customIntervalUnit`.

## Rules

- Name is required.
- Amount must be greater than `0`.
- Category must exist.
- Payment schedule must match the selected frequency.
- Custom recurrence requires a positive interval count and supported interval unit.
- Statement day, when present, must be from `1` to `31`.
- Last paid date, when present, must be a valid ISO date.
- Deactivating an expense keeps the record available without treating it as active.

## Derived Values

`nextOccurrenceAt` is derived from the recurrence configuration and the last paid date or creation date. It is not persisted as an independent source of truth.

## Server Module

Recurring expense business rules are owned by `src/lib/server/recurring-expenses`.

Client-safe types, labels, and occurrence helpers live in `src/lib/modules/recurring-expenses`.
