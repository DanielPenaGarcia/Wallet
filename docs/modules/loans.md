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

## Dashboard And Projections

The dashboard shows pending borrowed debt, pending lent receivables, next loan payments, and next expected collections.

Money receivable is not added to available cash until a `loan_collection` movement exists. Loan principal received is reflected in the account balance through `loan_received`, but it remains visible as debt through the loan outstanding amount.

Financial planning treats remaining borrowed-loan installments as future obligations. Expected collections from lent loans are not counted as free money until collected.
