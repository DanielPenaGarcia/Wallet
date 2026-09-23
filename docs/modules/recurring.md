# Recurring

The `recurrentes` section is available from the sidebar and opens `/recurrentes`.

## Tabs

The page uses the shared tabs component. It includes `Gastos` for recurring expenses and `Ingresos` for recurring income.

## Expenses

The `Gastos` tab manages `RecurringExpense` records.

Available actions:

- `Registrar`: opens a modal to create a recurring expense with category, optional expected payment account, amount, amount kind, frequency, payment schedule, optional statement day, last paid date, and active state.
- `Editar`: opens a modal with the selected recurring expense data.
- `Eliminar`: removes the recurring expense configuration.

The tab displays configured expenses with category, expected payment account, amount, amount kind, frequency, payment schedule, next occurrence, active state, and row actions.

Rules:

- A recurring expense requires an existing category.
- Expected payment account is optional.
- When selected, the expected payment account must be an active debit or credit account.
- Selecting an expected payment account does not register a real payment and does not change account balances.
- Supported amount kinds are `Fijo` and `Estimado`.
- Supported frequencies are `Diario`, `Semanal`, `Quincenal`, `Mensual`, `Anual`, and `Personalizado`.
- Custom frequency requires an interval count and interval unit.
- Payment schedule must match the selected frequency.
- Optional statement day must be a month day from `1` to `31`.
- Optional last paid date must be a valid ISO date.

## Income

The `Ingresos` tab manages `RecurringIncome` records.

Available actions:

- `Registrar`: opens a modal to create a recurring income with title, expected amount, source, frequency, payment configuration, active state, and optional work schedule when the source is `Trabajo`.
- `Editar`: opens a modal with the selected recurring income data.
- `Eliminar`: removes the recurring income configuration.

The tab displays the configured incomes in a table with title, source, amount, frequency, payment schedule, work schedule summary, active state, and row actions.

Rules:

- Supported income sources are `Trabajo`, `Negocio`, `Apoyo`, `Renta`, and `Otro`.
- Supported frequencies are `Diario`, `Semanal`, `Quincenal`, and `Mensual`.
- The payment frequency defines when money is expected and is not inferred from the work schedule.
- Work schedules are only stored for `Trabajo`.
- A work day can contain one or more time blocks.
- Time blocks on the same day must not overlap.
- A block start time must be earlier than its end time.
- The expected amount is stored per payment period.

## Shared Planning Use

Financial goal projections read active recurring incomes and active recurring expenses to estimate free money periods. Recurring configuration does not create movements by itself.

Recurring expenses expose a reusable read model grouped by expected payment account type. `debit` expenses represent direct cash needs, `credit` expenses represent expected card consumption, and `unassigned` expenses need user attention before planning can classify them. The group is derived from `Account.type`.

Income and expense next-date calculations share the recurrence helper in `src/lib/shared/utils/recurring-payment-schedule.ts`; module-specific code is responsible for validating which frequencies each record type supports.

## Movement Materialization

Recurring income and recurring expense records remain expected configuration. They do not change account balances directly.

When money is actually received or paid, the movement module can create an income or expense movement linked to the recurring record. The movement owns the balance impact. Wallet rejects duplicate active materializations for the same recurring configuration, movement type, and effective date so repeated submissions do not double count the same event.
