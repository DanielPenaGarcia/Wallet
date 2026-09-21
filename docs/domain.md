# Domain Conventions

## Money

Persisted and shared monetary values are integer minor units. In the current product that means cents.

Names must make this explicit:

- `amountCents`
- `balanceCents`
- `expectedAmountCents`
- `targetAmountCents`
- `currentAmountCents`
- `paidAmountCents`

UI forms may accept decimal strings, but services and repositories receive integer cents.

## Derived Values

Derived values are not persisted unless the product needs historical audit.

Examples:

- Credit available is `creditLimitCents - balanceCents`.
- Goal progress is `currentAmountCents / targetAmountCents`.
- Statement outstanding balance is `statementBalanceCents - paidAmountCents`.
- Installment purchase outstanding amount is derived from installment counters.

## Reference Safety

Catalog records that provide historical context cannot disappear while referenced.

- A bank referenced by any account cannot be deleted.
- A category with child categories cannot be deleted.
- A category referenced by recurring expenses cannot be deleted.

## Category Essentiality

`Category.isEssential` is explicit per category. Child categories do not inherit essentiality from parents.

Allocation and filtering logic must read the category assigned to the obligation or movement instead of inferring from ancestors.

## Recurrence

Payment recurrence describes when money is expected or owed. Work schedule describes when work happens. They are separate concepts.

Recurring incomes currently support daily, weekly, semimonthly, and monthly payment schedules.

Recurring expenses currently support daily, weekly, semimonthly, monthly, yearly, and custom schedules.

Shared recurrence date calculation lives in `src/lib/shared/utils/recurring-payment-schedule.ts`. Income and expense modules should reuse it when calculating future payment or obligation dates.

## Movements

Movement is the conceptual base for financial operations that actually happened. Movement-backed balance changes are still evolving, but future balance mutations should flow through explicit financial events instead of unrelated modules changing balances independently.
