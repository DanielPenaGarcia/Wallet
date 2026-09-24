# Loan

`Loan` represents money received from a third party or money delivered by the user with an expected repayment.

## Directions

- `borrowed`: money the user received and must repay.
- `lent`: money the user delivered and expects to collect.

## Monetary Fields

- `principalAmountCents`: money actually received or delivered.
- `totalRepaymentCents`: contractual total to pay or collect.
- `financingCostCents`: derived as `totalRepaymentCents - principalAmountCents`.

All persisted money amounts use cents.

## Installments

Loans use monthly installments from `firstPaymentDate`.

Installments are calculated from `totalRepaymentCents`, not from principal. The installment distribution must sum exactly to the contractual total. When cents do not divide evenly, the first installments receive the one-cent remainder.

The pending balance is derived from active `loan_payment` and `loan_collection` movements. It is not stored as an independent editable balance.

## Movement Semantics

- `loan_received`: principal from a `borrowed` loan enters a real-money account.
- `loan_disbursement`: principal from a `lent` loan leaves a real-money account.
- `loan_payment`: repayment of a `borrowed` loan leaves a real-money account.
- `loan_collection`: collection of a `lent` loan enters a real-money account.

Loan movements are not ordinary income or expense. They do not use category, recurring income, or recurring expense classification.

Payments and collections cannot exceed the outstanding contractual balance.

Active loans can be edited without changing their direction, opening account, or currency. The currency is fixed at creation because movement totals are stored in minor units without conversion.

Before payments or collections exist, editing the principal updates the linked opening movement so the real-money account balance remains derived from movements instead of from the loan row alone. The loan update, opening movement update, and account balance update are persisted atomically.

After payments or collections exist, only descriptive fields can change: name and counterparty. Principal, total repayment, installment count, first payment date, and currency remain locked because changing them would reinterpret the existing schedule. A future restructuring flow should be explicit instead of overloading ordinary edit.

Deleting a loan reverses its active linked movements first and then removes the loan record. Borrowed loans reverse payments before opening; lent loans reverse opening before collections. If any reversal would leave an account with an invalid balance, deletion is rejected. Reversals, balance updates, and loan deletion are atomic.

Cancelling a loan keeps the row and movement history intact, but prevents future loan edits and settlements.
