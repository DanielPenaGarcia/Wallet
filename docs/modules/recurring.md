# Recurring

The `recurrentes` section is available from the sidebar and opens `/recurrentes`.

## Tabs

The page uses the shared tabs component. It includes `Gastos` for recurring expenses and `Ingresos` for recurring income.

## Expenses

The `Gastos` tab currently exposes an empty section only. It does not define recurring expense entities, persistence, service logic, validation rules, or actions yet.

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
