# Dashboard

The root route `/` is the main Wallet dashboard.

## Scope

The dashboard is a read model. It summarizes current data from accounts, movements, recurring configuration, credit card statements, and financial goals.

It does not persist derived metrics, mutate balances, create reserves, or run the future allocation engine.

## Current Summary

The dashboard calculates:

- Available money from personal and debit account `balanceCents`.
- Consumed credit from credit account `balanceCents`, including inactive cards with pending debt.
- Credit available from `creditLimitCents - balanceCents`.

Available credit is not treated as real money.

## Monthly Activity

Monthly activity is calculated from active movements in the current calendar month:

- `income` counts as income for the month.
- `expense` counts as paid expense.
- `credit_purchase` counts as period spending even if it is paid later.
- `credit_card_payment` is shown separately and is not counted again as spending.
- `transfer` and `adjustment` are not counted as income or expense activity.

The dashboard reads the recent activity list with a bounded movement query instead of loading the full history.

## Upcoming Recurring Events

The next income and upcoming expenses come from active recurring income and recurring expense configuration.

Recurring configuration remains planning data. It does not change account balances until a movement is registered.

## Credit Cards

The credit card block shows each credit account with:

- Current consumed balance.
- Available credit.
- Credit limit.
- Current outstanding amount from the latest registered statement.
- Payment due date from the latest registered statement.
- Link to the credit card detail page.

The outstanding statement amount is derived from `statementBalanceCents - paidAmountCents`, clamped at zero. It does not use account balance as the amount due.

## Goals

The dashboard lists active goals and their current progress. The next contribution is an estimate from the first projected free-money period and each goal's distribution percentage.

Projected free money is not presented as real available balance.

## Loans

The dashboard summarizes active loans separately from cash:

- Pending borrowed debt.
- Pending lent receivables.
- Next loan payment.
- Next expected loan collection.

Receivables are not added to available money until a `loan_collection` movement exists.
