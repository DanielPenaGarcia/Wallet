# Planning

The `planificacion` section is available from the sidebar and opens `/planificacion`.

Planning explains how the next expected income can be used until the following expected income.

## Period

The base period starts on the next active recurring income date.

The period normally ends on the immediately following recurring income date. Multiple incomes on the same date are grouped into one inflow.

If no following income is found within the planning search horizon, the plan keeps `period.endDate` as `null`, raises an alert, and uses a 30-day operational fallback to avoid returning an empty recommendation.

## Inputs

Planning reads:

- active recurring incomes.
- active recurring expenses.
- personal and debit account balances.
- credit card latest statements.
- active financial goals.
- active borrowed-loan installments.

Credit available is not treated as real money.

## Obligation Classification

Recurring expenses are classified from their expected payment account:

- debit account: direct cash need.
- credit account: expected credit consumption.
- no account: user attention item.

Expected credit consumption does not also become an immediate cash reserve. Cash need for credit comes from statement payments that are due inside the planning period.

Borrowed-loan installments due inside the period are treated as cash obligations. Expected collections from lent loans are not counted as available money until actual movements exist.

## Existing Real Money

Planning adds current personal and debit balances to the next income amount before allocating obligations.

It allocates cash obligations in date order and reports covered and uncovered amounts. This allows the UI to show whether an obligation is already covered by existing money or whether the period has insufficient funds.

## Goals

After cash obligations are covered, remaining free cash is distributed to active financial goals using their `distributionPercentage`.

Goal allocations are capped by the goal's remaining amount. Any money not consumed by obligations or active goal distribution remains `remainingFreeCashCents`.

## Outputs

The next-income plan returns:

- next income date, amount, and contributing income titles.
- planned period start and end.
- existing real money and total cash available.
- cash obligations, credit consumptions, statement payments, and unassigned recurring expenses.
- covered and uncovered cash obligation totals.
- free cash before goals.
- suggested goal allocations.
- remaining free cash.
- alerts for missing following income, unassigned obligations, and insufficient funds.
