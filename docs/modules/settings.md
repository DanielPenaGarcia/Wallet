# Settings

The `settings` section is available from the sidebar and opens `/settings`.

## Tabs

The page uses the shared tabs component. It includes `Bancos` for registered `Bank` records and `Categorías` for expense category records.

## Banks

The bank section shows a table with each bank's name, alias, and color marker.

Available actions:

- `Registrar`: opens a modal to create a bank with name, alias, and color.
- `Editar`: opens a modal with the selected bank data.
- `Eliminar`: opens a confirmation modal and removes the bank from the catalog.

## Categories

The category section shows a searchable category tree. The search can be narrowed to essential categories. Root categories can have a color and subcategories; subcategories inherit hierarchy only and do not store a color.

Available actions:

- `Nueva categoría`: opens a modal to create a root category with name, color, and the essential flag.
- `Agregar subcategoría`: opens a modal to create a child category under a root category.
- `Editar`: updates the category name, root color when applicable, and essential flag.
- `Eliminar`: removes the category from the catalog. Child categories are also removed through the database cascade.

Rules:

- Category names must be unique within the same parent level.
- A child category requires an existing parent category.
- Root categories require a valid hexadecimal or rgb color from the settings form.
- The essential flag marks categories whose associated expenses are considered necessary or worthwhile.
