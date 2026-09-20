# Financial Goals

The `metas` section is available from the sidebar and opens `/metas`.

## Scope

The module manages financial goals and estimates progress using projected free money.

Projected free money is calculated from active recurring income and active recurring expense configuration. The goal module does not create actual money movements.

## Available Actions

- `Nueva meta`: opens a modal to create a financial goal.
- `Editar`: opens a modal with the selected goal data.
- `Eliminar`: removes the goal.

## Goal Configuration

The form captures:

- Name.
- Target amount.
- Current accumulated amount.
- Currency code.
- Type.
- Priority.
- Status.
- Distribution percentage of projected free money.

The form also previews projected contribution, estimated remaining periods, and estimated completion date when enough recurring income and expense data exists.

## List Display

The list displays:

- Total active distribution percentage.
- Remaining undistributed percentage.
- Goal type, status, and priority.
- Target, accumulated, and remaining amounts.
- Distribution percentage.
- Estimated next contribution.
- Estimated remaining time.
- Estimated completion date.
- Progress percentage and progress bar.

## Distribution Rules

Only goals with status `active` consume distribution capacity.

Active goals must use at least `1%`, and the total distribution across active goals cannot exceed `100%`.

Paused, completed, and cancelled goals do not receive projected contributions.

## Projection

Projection is derived from recurring configuration:

1. Active recurring incomes are projected into future income events.
2. Active recurring expenses are projected into obligation events.
3. Free money is calculated per income period.
4. Each active goal receives its configured percentage of that free money.

If there are no future incomes, no free money, or the configured horizon cannot reach the target, the UI shows the corresponding unavailable reason.

