# Financial Goal

`FinancialGoal` represents a target that receives a percentage of projected free money.

## Fields

- `id`: unique goal identifier.
- `name`: user-facing goal name.
- `targetAmountCents`: target amount stored in cents.
- `currentAmountCents`: accumulated amount stored in cents.
- `distributionPercentage`: percentage of free money assigned to the goal.
- `currencyCode`: three-letter currency code. Defaults to `MXN`.
- `priority`: goal priority. Supported values are `high`, `medium`, and `low`.
- `status`: goal status. Supported values are `active`, `paused`, `completed`, and `cancelled`.
- `type`: goal category. Supported values are `purchase`, `emergency_fund`, `travel`, `savings`, and `other`.
- `createdAt`: creation timestamp.
- `updatedAt`: last update timestamp.

## Derived Values

Goal progress is derived from accumulated and target amounts:

```text
progress = currentAmountCents / targetAmountCents
```

Remaining amount is also derived:

```text
remaining = targetAmountCents - currentAmountCents
```

The module also derives projections using recurring income and recurring expense configuration. Projected contributions are based on the goal's active distribution percentage and projected free money periods.

## Distribution

Only active goals consume distribution capacity.

The total distribution assigned to active goals must not exceed `100%`. Paused, completed, and cancelled goals may keep a `distributionPercentage`, but they do not consume active distribution in validation or projection.

## Rules

- Name is required and must be unique after normalization.
- Target amount must be greater than `0`.
- Current amount cannot be negative.
- Distribution must be between `0` and `100`.
- Active goals must distribute at least `1%`.
- Active goal distribution cannot exceed the remaining unassigned percentage.
- Currency code must contain exactly three uppercase letters after normalization.
- Priority, status, and type must be one of the supported values.

## Server Module

Financial goal business rules are owned by `src/lib/server/goals`.

The service normalizes names and currency codes, validates amounts and catalog values, checks available distribution for active goals, enforces unique names, verifies records before update or delete operations, and delegates persistence through the financial goal repository contract.

