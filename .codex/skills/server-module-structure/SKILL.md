---
name: server-module-structure
description: Use this when creating or refactoring server-side domain modules so they follow the repository/service structure under src/lib/server.
---

# Server Module Structure

When creating or refactoring a server-side domain module, use the domain folder directly under `src/lib/server/<domain>/`.

Use this structure as the default:

```text
src/lib/server/<domain>/
|-- <domain>.repository.ts
|-- drizzle-<domain>.repository.ts
|-- <domain>.service.ts
|-- <domain>.errors.ts
`-- inputs/
    |-- create-<domain>.input.ts
    `-- update-<domain>.input.ts
```

The module boundary should be domain-oriented. Do not create new domain modules under `src/lib/server/modules/<domain>/`. When touching an existing module in that older location, either keep the change minimal or migrate it fully to the new structure if the user asks for the new architecture.

## Responsibilities

`<domain>.repository.ts` defines the persistence contract as an interface. It should describe the operations the service needs using domain language, without Drizzle imports or database details.

`drizzle-<domain>.repository.ts` implements that interface using Drizzle and `$lib/server/db`. Keep SQL/query details here. Inject the database through the constructor with `db` as the default value so tests and future callers can provide another database instance.

`<domain>.service.ts` owns application and business rules. Prefer a service class that receives the repository interface in its constructor and exports a singleton wired to the Drizzle implementation. Keep validation, normalization, uniqueness checks, not-found checks, and orchestration in this layer.

`<domain>.errors.ts` contains domain-specific errors. Throw these from the service, not from UI code.

`inputs/` contains input types for service methods. Keep input names in English, such as `CreateBankInput` and `UpdateBankInput`.

## Exports And Usage

Routes and server callers should import the exported service singleton from the new module folder, for example:

```ts
import { bankService } from '$lib/server/banks/bank.service';
```

Expose service methods on the singleton rather than importing repository functions directly from route handlers. Repository implementations should remain internal to the module wiring unless a task explicitly requires otherwise.

## Migration Guidance

When migrating an older functional module:

- Move persistence functions behind the repository interface.
- Move Drizzle-specific code into `drizzle-<domain>.repository.ts`.
- Preserve existing behavior, errors, and user-facing messages unless the task asks to change them.
- Update imports from `$lib/server/modules/<domain>/...` to `$lib/server/<domain>/...`.
- Remove the old module files only after confirming no imports remain.

Keep the refactor scoped to the touched domain. Do not migrate unrelated modules just to make the tree symmetrical.
