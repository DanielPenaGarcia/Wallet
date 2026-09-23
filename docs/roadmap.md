# Roadmap

## Implemented Foundation

- SvelteKit app shell and navigation.
- SQLite and Drizzle schema.
- Settings for application profile, color palettes, banks, and categories.
- Accounts for personal cash, debit, and credit.
- Explicit balance adjustments for personal, debit, and credit accounts.
- Historical credit card statements.
- Historical installment purchases.
- Recurring incomes.
- Recurring expenses.
- Financial goals and projection from recurring configuration.
- Next-income planning for recurring obligations, card payments, existing real money, and goal distribution.
- Loans for borrowed and lent money with monthly installment schedules.

## Foundation Cleanup

- Keep module architecture consistent.
- Keep money represented as integer cents.
- Keep recurring rules shared where the behavior is equivalent.
- Keep movement semantics explicit before adding more balance-changing modules.
- Keep Allocation Engine pure and testable.

## Planned Product Areas

- Full Allocation Engine.
- Dashboard read model for current summary, monthly activity, recurring events, credit obligations, active goals, and recent movements.
- Reserved funds.
- Future commitments.
- Movement-backed account and card balance changes.
- Historical allocation decisions.

## Out Of Scope For The MVP

- Bank integrations.
- Bank scraping.
- OCR for statements.
- Multiuser support.
- Distributed infrastructure.
- Queues, Redis, or microservices.
- Native mobile app.
- Automatic bank synchronization.
