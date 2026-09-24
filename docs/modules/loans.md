# Loans

The `prestamos` section is available from the sidebar and opens `/prestamos`.

## Scope

The module manages loans in two directions:

- `Por pagar`: loans received from third parties.
- `Por cobrar`: money lent by the user.

The first implementation supports fixed monthly installments from a first payment date. Complex amortization tables, variable rates, and bank-specific interest schedules are out of scope.

## Available Actions

- `Nuevo préstamo`: creates the loan configuration and materializes the initial principal movement.
- `Ver detalle`: opens `/prestamos/[id]` with summary, progress, and installment schedule.
- `Editar`: updates active loan terms and synchronizes the opening movement amount, title, and counterparty description so account balances stay consistent.
- `Eliminar`: reverses active loan movements through the movement service and removes the loan record when the reversal is safe.
- `Registrar pago`: records a real payment for a borrowed loan.
- `Registrar cobro`: records a real collection for a lent loan.
- `Cancelar préstamo`: marks the loan as cancelled.

## Balance Rules

Receiving a loan is not income. Lending money is not an expense.

Loan opening, payments, and collections change account balances only through movement records:

- Borrowed loan opening creates `loan_received`.
- Lent loan opening creates `loan_disbursement`.
- Borrowed loan payment creates `loan_payment`.
- Lent loan collection creates `loan_collection`.

Only personal and debit accounts can participate in loan movements. Credit cards are not real-money accounts for this module.

Editing cannot change the loan direction, opening account, or currency. The currency is immutable because Wallet does not convert historical loan movements across currencies.

Before any payment or collection exists, editing may change the principal, total contractual amount, installment count, and first payment date. Principal edits update the opening movement and its account balance impact inside the same transaction as the loan row.

After any payment or collection exists, editing is limited to the loan name and counterparty. Wallet does not currently model formal restructures, so changing principal, total, installment count, or first payment date after settlements is blocked to avoid reinterpreting historical installments.

The contractual total can never be lower than the amount already paid or collected.

Deleting a loan is only allowed when its linked active movements can be safely reversed without breaking account balance rules. Borrowed loans reverse payments before the opening movement; lent loans reverse the opening movement before collections. The movement reversals, balance updates, and loan deletion run inside one transaction, so a failed reversal leaves the loan, movements, and balances unchanged.

Cancelling a loan only changes its status and keeps all history. It does not reverse movements or remove the loan record.

## Dashboard And Projections

The dashboard shows pending borrowed debt, pending lent receivables, next loan payments, and next expected collections.

Money receivable is not added to available cash until a `loan_collection` movement exists. Loan principal received is reflected in the account balance through `loan_received`, but it remains visible as debt through the loan outstanding amount.

Financial planning treats remaining borrowed-loan installments as future obligations. Expected collections from lent loans are not counted as free money until collected.
