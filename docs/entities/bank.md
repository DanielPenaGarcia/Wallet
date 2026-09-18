# Bank

`Bank` represents a bank available in the application settings catalog.

## Attributes

- `id`: unique technical identifier.
- `name`: official or display name of the bank.
- `alias`: short label used to recognize the bank quickly in the UI.
- `color`: hexadecimal color used as the visual marker for the bank.

## Current Scope

The entity can be registered, edited, listed, and deleted from the settings page.

Registration and edit forms capture `name`, `alias`, and `color`. The `color` value is normalized to hexadecimal when the input is a valid hex or rgb color.
