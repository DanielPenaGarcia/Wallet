# Accounts

The `cuentas` section is available from the sidebar and opens `/cuentas`.

## Scope

The module manages:

- The automatic personal cash account.
- Debit accounts associated with registered banks.
- Credit cards associated with registered banks.

It does not implement purchases, payments, credit card statements, MSI purchases, minimum payments, payment to avoid interest, or movement history for credit cards.

## Available Actions

- `Nueva cuenta`: opens a modal to register a debit account or credit card.
- `Editar`: opens a modal with the selected account configuration.
- `Ajustar saldo`: corrects personal and debit balances and stores an adjustment reason.
- `Activar` / `Desactivar`: toggles credit card active state.
- `Eliminar`: deletes debit and credit accounts. The personal account cannot be deleted.

## Debit Accounts

Debit accounts store real available money.

Captured fields:

- Name.
- Bank.
- Last four card digits.
- Card color.
- Initial balance.

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

## Balance Responsibilities

Personal and debit account balances can be corrected through adjustment history.

Credit card balance is part of the credit card's current state and is edited from the card configuration. Future movement functionality will be responsible for increasing or decreasing that balance.

## Persistence

Accounts are stored in `accounts`.

Manual balance corrections for personal and debit accounts are stored in `account_adjustments`.

Credit card available credit is not persisted. It is derived from `creditLimitCents - balanceCents`.

