# Wallet

Wallet is a local-first personal finance manager built with SvelteKit, TypeScript, Tailwind CSS, and IndexedDB in each installed browser. The former SQLite/Drizzle code remains for one-time data export and reference.

The application helps answer one practical question:

> Tengo una cantidad de dinero disponible. A donde deberia dirigirla primero?

Wallet is not only an expense log. Its purpose is to keep financial context explicit: real cash, credit usage, recurring obligations, statement dates, installment purchases, goals, and projected free money.

## Run Locally

```bash
pnpm install
pnpm dev
```

`pnpm dev` is for development. Service workers are registered by the production build, not by the development server. Legacy SQLite export tooling still uses `DATABASE_URL` from `.env`.

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
production build on your computer:

```bash
pnpm build
pnpm preview
```

For installation on an iPhone, serve the contents of `build/` at an HTTPS origin
trusted by the phone. Open the site in Safari, choose **Add to Home Screen** →
**Open as Web App**, then launch it from the Home Screen while online. Wait for
the service worker to finish installing before disconnecting. Its cache must
contain `/index.html`, the manifest, and every versioned build asset; test by
turning off connectivity, closing the app, and launching it again.

An `http://192.168.x.x` address can be added to the Home Screen, but cannot
register a service worker on the iPhone. `http://localhost` is only a secure
context on the device itself. If Wallet was previously installed from an HTTP
address, first export its data from **Settings → Aplicación → Descargar respaldo**.
Install the HTTPS origin separately and restore the file there: each origin and
Home Screen installation has its own local storage. Do not delete the old
installation until the backup has been restored and verified.

The service worker keeps a complete static app shell and build assets on the
device. Once installed from HTTPS, Wallet reads and writes financial data in
local IndexedDB, without a permanent server. Later app updates require serving
the new build again from the same HTTPS origin. Export backups outside the app:
deleting the installation or clearing its browser storage can erase local data.

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

Wallet is a local-first SvelteKit app. Client routes read the local IndexedDB database, and a layout handler applies form submissions locally. Legacy server services and SQLite repositories are kept as reference and for one-time export tooling; they are not needed to run the installed app.

```text
src/lib/local/finance-db.ts      IndexedDB persistence, local read models and writes
src/lib/modules/<module>         Svelte components, UI/shared types, pure helpers
src/lib/shared                   cross-module client-safe utilities and types
src/routes                       client route adapters
src/service-worker.ts            offline app shell and versioned asset cache
src/lib/server                   legacy SQLite services, repositories and schema
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
pnpm build
DATABASE_URL=:memory: pnpm test
```
