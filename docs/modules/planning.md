# Planning

The `planificacion` section is available from the sidebar and opens `/planificacion`.

Planning explains how the next expected income can be used until the following expected income.

## Period

The base period starts on the next active recurring income date.

The period normally ends on the immediately following recurring income date. Multiple incomes on the same date are grouped into one inflow.

The interval uses `[startDate, endDate)` semantics: obligations on `startDate` are included, and obligations exactly on `endDate` are excluded because they belong to the next income period. The same convention applies to recurring expenses, credit card statement payments, and borrowed-loan installments.

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

A recurring expense without a payment account remains visible as a user attention item and raises an alert, but it is not treated as debit or cash until the user assigns a payment account. It must not inflate the recommended amount to set aside from the next income.

Borrowed-loan installments due inside the period are treated as cash obligations. Expected collections from lent loans are not counted as available money until actual movements exist.

## Existing Real Money

Planning distinguishes current personal/debit balances from the next income.

It allocates cash obligations in date order using existing real money first and the next income second. Each obligation reports:

- amount covered by existing money.
- amount recommended to set aside from the next income.
- amount still uncovered after both sources.

The plan also exposes aggregate totals for existing money used, next-income reserves, and uncovered obligations. These values are derived recommendations only; Planning does not create movements, envelopes, or persisted reserves.

## Goals

After recommended obligation reserves are calculated, only the remaining amount from the next income is distributed to active financial goals using their `distributionPercentage`.

Goal allocations are capped by the goal's remaining amount. Any next-income money not consumed by recommended reserves or active goal distribution remains `remainingNextIncomeCents`.

## Outputs

The next-income plan returns:

- next income date, amount, and contributing income titles.
- planned period start and end.
- existing real money, total cash available, and existing money already used for obligations.
- cash obligations, credit consumptions, statement payments, and unassigned recurring expenses.
- covered and uncovered cash obligation totals.
- recommended amount to set aside from the next income.
- next-income amount available for goals.
- suggested goal allocations and their aggregate total.
- remaining next-income money after obligations and goals.
- alerts for missing following income, unassigned obligations, and insufficient funds.
