# Roadmap

## Implemented Foundation

- SvelteKit app shell and navigation.
- SQLite and Drizzle schema.
- Settings for application profile, color palettes, banks, and categories.
- Accounts for personal cash, debit, and credit.
- Manual balance adjustments for personal and debit accounts.
- Historical credit card statements.
- Historical installment purchases.
- Recurring incomes.
- Recurring expenses.
- Financial goals and projection from recurring configuration.

## Foundation Cleanup

- Keep module architecture consistent.
- Keep money represented as integer cents.
- Keep recurring rules shared where the behavior is equivalent.
- Keep movement semantics explicit before adding more balance-changing modules.
- Keep Allocation Engine pure and testable.

## Planned Product Areas

- Full Allocation Engine.
- Dashboard distribution workflow.
- Accounts receivable.
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
