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

Active loans can be edited without changing their direction or opening account. Editing the principal updates the linked opening movement so the real-money account balance remains derived from movements instead of from the loan row alone.

Deleting a loan reverses its active linked movements first and then removes the loan record. If any reversal would leave an account with an invalid balance, deletion is rejected.
