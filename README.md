# Wallet

Wallet is a personal finance manager built with SvelteKit, TypeScript, Tailwind CSS, Drizzle ORM, and SQLite.

The application helps answer one practical question:

> Tengo una cantidad de dinero disponible. A donde deberia dirigirla primero?

Wallet is not only an expense log. Its purpose is to keep financial context explicit: real cash, credit usage, recurring obligations, statement dates, installment purchases, goals, and projected free money.

## Run Locally

```bash
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm dev
```

The app uses SQLite through `DATABASE_URL`. For local development, `.env.example` points to `local.db`.

Useful commands:

```bash
pnpm check
pnpm build
pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:seed:categories
pnpm db:seed:color-palettes
```

## Install as an app

Wallet includes a web app manifest, install icons, and a service worker. To try the
production build on your computer, run the database migrations, then:

```bash
pnpm build
pnpm preview
```

Open the local preview URL in a compatible browser and use its **Install app**
action. On iPhone, Safari can use **Add to Home Screen** → **Open as Web App**
even when Wallet is served over HTTP from a computer on the same local network.
The icon and standalone presentation work in that case, but an HTTP LAN address
such as `http://192.168.x.x` is not a secure context, so the service worker and
offline fallback require HTTPS. `http://localhost` is a secure context only on
the device where the browser is running. Keep the server reachable from the
iPhone while using Wallet; do not expose a personal finance database publicly
without access protection.

The service worker caches versioned JS/CSS and public icons. It shows a simple
offline page if a full navigation cannot reach the server. Account data and
movements always need the server; offline changes and synchronization are not
supported.

## Current Scope

Wallet currently includes:

- Application settings, local profile preferences, and configurable color palettes.
- Bank catalog.
- Hierarchical expense categories.
- Personal cash, debit, and credit accounts.
- Explicit balance adjustments for cash, debit, and credit accounts.
- Historical credit card statements.
- Historical months-without-interest installment purchases.
- Recurring incomes.
- Recurring expenses.
- Financial goals with projected contributions from recurring income and expense configuration.
- Loans for borrowed and lent money with movement-backed payments and collections.
- Dashboard read model for cash, credit, recurring events, goals, loans, and recent movement activity.

Still planned or conceptual:

- Full Allocation Engine.
- Reserved funds.
- Future commitments.

## Architecture

Wallet is a modular monolith. Route files adapt SvelteKit requests and forms; business rules live in services; repositories own database access; client-safe UI code, types, and pure helpers live under `src/lib/modules`.

```text
src/lib/server/<module>          private server services, repositories, inputs, errors
src/lib/server/db                Drizzle schema, database client, migrations
src/lib/modules/<module>         Svelte components, UI/shared types, pure helpers
src/lib/shared                   cross-module client-safe utilities and types
src/routes                       SvelteKit route adapters
docs/entities                    entity fields, invariants, derived values
docs/modules                     user-facing module scope and workflows
```

More detail:

- [Architecture](docs/architecture.md)
- [Domain conventions](docs/domain.md)
- [Roadmap](docs/roadmap.md)
- [Allocation Engine boundary](docs/modules/allocation-engine.md)

## Domain Rules

- Persisted monetary values are integer minor units and use explicit names such as `amountCents`, `balanceCents`, `targetAmountCents`, and `expectedAmountCents`.
- Derived values are calculated unless they need to be stored for history or audit.
- Credit available is not income.
- Historical credit card statements and installment purchases explain credit balance composition; they do not mutate `accounts.balanceCents`.
- Bank and category deletion is restricted when references would lose financial context.
- Category `isEssential` is explicit per category; child categories do not inherit it automatically.
- Recurring income payment schedules and work schedules are separate concepts.

## Documentation

Entity docs:

- [Account](docs/entities/account.md)
- [Bank](docs/entities/bank.md)
- [Category](docs/entities/category.md)
- [Color Palette](docs/entities/color-palette.md)
- [Credit Card Statement](docs/entities/credit-card-statement.md)
- [Financial Goal](docs/entities/financial-goal.md)
- [Installment Purchase](docs/entities/installment-purchase.md)
- [Loan](docs/entities/loan.md)
- [Movement](docs/entities/movement.md)
- [Recurring Expense](docs/entities/recurring-expense.md)
- [Recurring Income](docs/entities/recurring-income.md)

Module docs:

- [Accounts](docs/modules/accounts.md)
- [Allocation Engine](docs/modules/allocation-engine.md)
- [Financial Goals](docs/modules/financial-goals.md)
- [Loans](docs/modules/loans.md)
- [Movements](docs/modules/movements.md)
- [Recurring](docs/modules/recurring.md)
- [Settings](docs/modules/settings.md)

## Technical Principles

- Keep financial logic outside Svelte components.
- Keep services independent from `Request`, `RequestEvent`, `FormData`, cookies, route params, and URLs.
- Keep repositories focused on persistence.
- Prefer shared client-safe pure utilities under `src/lib/shared` when behavior is reused by multiple modules.
- Use `ActionButton` for user-triggered application actions.
- Add or update docs when changing business rules.

## Validation

Run this before considering changes complete:

```bash
pnpm check
```
