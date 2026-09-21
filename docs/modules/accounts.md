# Accounts

The `cuentas` section is available from the sidebar and opens `/cuentas`.

## Scope

The module manages:

- The automatic personal cash account.
- Debit accounts associated with registered banks.
- Credit cards associated with registered banks.
- Historical installment purchases for credit cards.
- Historical credit card statements.

It does not implement minimum payments, payment to avoid interest, interest, commissions, automatic statement generation, or full movement history for credit cards inside the accounts module. Credit card payments and movement-based purchases belong to the movement module.

## Available Actions

- `Nueva cuenta`: opens a modal to register a debit account or credit card.
- `Editar`: opens a modal with the selected account configuration.
- `Ajustar saldo`: registers an explicit adjustment movement for personal and debit balances.
- `Activar` / `Desactivar`: toggles credit card active state.
- `Eliminar`: deletes debit and credit accounts. The personal account cannot be deleted. Deleting an account does not delete the bank record.
- `Ver detalle`: opens a credit-card-only detail page for summary and installment purchases.
- `Registrar compra MSI`: registers a historical installment purchase for a credit card.
- `Registrar corte`: registers the latest known credit card statement without changing current consumed balance.
- `Editar corte`: updates any historical credit card statement without changing current consumed balance.

## Debit Accounts

Debit accounts store real available money.

Captured fields:

- Name.
- Bank.
- Last four card digits.
- Card color.
- Initial balance.
- Balance reference date.

The list preview uses the same compact visual structure as credit cards and displays balance, card ending, type, and bank.

## Credit Cards

Credit cards store the current financial state and basic configuration of a credit line.

Captured fields:

- Name.
- Bank.
- Optional last four card digits.
- Card color.
- Credit limit.
- Current consumed balance.
- Balance reference date.
- Statement day.
- Payment due day.
- Active state.

The list preview displays:

- Balance.
- Available credit.
- Credit limit.
- Credit usage percentage and a progress bar.
- Statement day.
- Payment due day.
- Active state.

Available credit and usage percentage are derived from persisted values. They are not stored.

Credit cards have a detail page at `/cuentas/[id]`.

The detail page is only valid for accounts with `type = credit`. Personal and debit accounts cannot use this view.

The detail page includes:

- `Resumen`: current consumed balance, available credit, credit limit, usage percentage, statement/payment days, active state, latest statement, current period projection, and installment purchase composition.
- `Compras a MSI`: historical installment purchase registration, edition, deletion, and per-purchase progress.
- Room for future credit movements without implementing them yet.

The installment purchase composition shows:

- Outstanding MSI amount.
- Unpaid billed MSI amount.
- Future MSI amount.
- Amount of the current consumed balance that is not explained by registered MSI purchases.

If outstanding MSI amount is greater than the card's current consumed balance, the UI shows a warning. The module does not block the state and does not auto-correct the balance.

The latest statement block shows the most recent `credit_card_statements` record by `statementDate DESC`.

The statement history block lists all registered statements for the card and allows editing their historical period dates, statement date, due date, statement balance, and paid amount. Editing a statement keeps the record attached to the same credit account and preserves the no-duplicate-statement-date rule.

The current period block shows:

- Current period dates and next statement date.
- Estimated normal unbilled consumption.
- Next MSI installments expected to enter the next statement.
- Estimated new statement charges.
- Previous statement outstanding amount.
- Base projected total for the next statement.

Projection labels must remain approximate. The UI must not present projected values as a guaranteed bank statement amount.

If the previous statement outstanding amount plus future MSI exceeds the current consumed balance, the UI shows a consistency warning and presents normal unbilled consumption as `0` while keeping the inconsistency detectable in domain output.

## Balance Responsibilities

Personal and debit account balances can be corrected through explicit adjustment movements and changed by movement creation.

Credit card balance is part of the credit card's current state at setup. Its balance reference date defines the last known state that movements should not replay. After creation, ordinary credit balance changes must be represented as purchases or card payments. Historical MSI purchase registration and historical statement registration explain composition only; those actions do not increase or decrease the card balance. Movement creation is responsible for ordinary credit purchases and card payments that increase or decrease consumed credit after that reference date.

## Persistence

Accounts are stored in `accounts`.

`accounts.balanceAsOfDate` stores the financial reference date of the captured balance. Existing accounts introduced before the field are migrated with `2026-09-21` as their known current-state boundary.

Legacy manual balance corrections for personal and debit accounts remain readable from `account_adjustments`.

New balance corrections are stored as `movements` with `type = adjustment`.

Credit card available credit is not persisted. It is derived from `creditLimitCents - balanceCents`.

Historical credit installment purchases are stored in `installment_purchases`.

Historical credit card statements are stored in `credit_card_statements`.
