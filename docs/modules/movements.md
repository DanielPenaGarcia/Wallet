# Movements

The movement module is the future source of truth for financial operations that happened.

## Scope

The current client module contains UI pieces for:

- Creating income, expense, and transfer movement forms.
- Bulk movement drafting.
- Listing, filtering, selecting, deleting, and exporting movements.

The server-side movement module is not yet part of the documented persistence layer in this cleanup pass.

## Intended Workflow

1. Capture the movement type.
2. Capture common fields: title, amount, and occurrence date.
3. Capture type-specific accounts and classification.
4. Persist the movement.
5. Apply balance effects through a single movement-aware service.

## Balance Boundary

New account, card, reserve, receivable, or commitment features should not independently mutate balances without going through explicit movement semantics.

This keeps balances explainable and keeps future allocation logic grounded in recorded events.
