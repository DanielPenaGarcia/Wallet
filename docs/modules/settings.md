# Settings

The `settings` section is available from the sidebar and opens `/settings`.

## Tabs

The page uses the shared tabs component. It includes `Aplicación` for application-level settings, `Bancos` for registered `Bank` records, and `Categorías` for expense category records.

## Application

The application section is the home for global application settings. Color palettes are stored in the database and expose base colors for `primary`, `secondary`, `tertiary`, `background`, and `surface`. Interaction and foreground tokens are calculated from those base hexadecimal values.

The section displays a color palette selector sourced from the database and a preview of the selected palette's base, hover, pressed, and foreground tokens. The selected palette id is persisted in browser storage under `wallet:color-palette-id`; the root layout applies the cached palette before the page paints so a reload keeps the selected theme without briefly flashing the default palette.

The application section also stores a local profile under `wallet:application-profile`. The profile has `Nombres` and `Apellidos`; the sidebar displays the first written name and first written surname, and uses their first letters for the account badge.

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
