# Color Palette

`ColorPalette` defines an application theme palette stored in the database.

## Fields

- `id`: unique palette identifier.
- `name`: palette display name.
- `primary`: primary action color.
- `secondary`: secondary color.
- `tertiary`: tertiary supporting color.
- `background`: application page background color.
- `surface`: card, panel, and elevated surface color.
- `isDefault`: marks the palette used by default.
- `createdAt`: timestamp for creation.
- `updatedAt`: timestamp for the last update.

## Derived Tokens

Only base hexadecimal colors are persisted. Runtime tokens are calculated from each base color:

- `on-{role}`: readable foreground selected by WCAG contrast between black and white.
- `{role}-hover`: interaction state mixed from the base color toward black or white according to relative luminance.
- `{role}-pressed`: stronger interaction state using the same luminance-based direction.

The Tailwind theme exposes these as `--color-on-{role}`, `--color-{role}-hover`, and `--color-{role}-pressed` for the roles `primary`, `secondary`, `tertiary`, `background`, and `surface`.

## Seed

Default color palettes can be loaded with `pnpm db:seed:color-palettes`. The initial seed includes `Noir absolutista`, a black and white palette marked as default, plus additional named palettes for warmer, mint, gold, blue, and coral themes.
