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

## Server Module

Bank business rules are owned by the server module at `src/lib/server/banks`. The service validates unique names, normalizes input values, checks that records exist before update or delete operations, and delegates persistence through the bank repository contract.
