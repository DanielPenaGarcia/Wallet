# Movements

The movement module is the source of truth for financial operations that happened.

## Scope

The current client module contains UI pieces for:

- Creating income, expense, and transfer movement forms.
- Bulk movement drafting.
- Listing, filtering, selecting, deleting, and exporting movements.

The server-side movement module has an initial persistence layer:

- `movements` table with effective financial date, technical timestamps, source/destination account references, optional category, and optional recurring configuration references.
- Repository contract and Drizzle adapter for creating and reading movements.
- Service-level validation for movement type semantics, account type participation, reference existence, credit balance reference dates, movement classification, recurring materialization uniqueness, and resulting balance invariants.
- Atomic creation that inserts the movement and updates affected account balances in the same database transaction.
- Atomic edition that reverses the original movement, applies the replacement movement, and updates affected balances without relying on simple amount differences.
- Atomic soft deletion that archives the movement and reverses its original balance impact.
- Explicit adjustment movements for post-start balance corrections from the accounts UI, including consumed-credit corrections.
- Linked recurring income and recurring expense materializations without letting the recurring records mutate balances by themselves.

Reading movements does not modify account balances and account reads still use the persisted `accounts.balanceCents` value directly.

## Intended Workflow

1. Capture the movement type.
2. Capture common fields: title, amount, and occurrence date.
3. Capture type-specific accounts and classification.
4. Optionally link the movement to the recurring income or expense configuration it materializes.
5. Persist the movement and balance effects through a single movement-aware service transaction.
6. For corrections, reverse the persisted movement impact before applying the replacement.

## Balance Boundary

New account, card, reserve, receivable, or commitment features should not independently mutate balances without going through explicit movement semantics.

This keeps balances explainable and keeps future allocation logic grounded in recorded events.

Recurring configuration remains planning data. A recurring income or expense changes account balances only when the user records a movement linked to that configuration. Wallet rejects a second active movement for the same recurring configuration, movement type, and effective date to avoid double counting duplicate submissions.
