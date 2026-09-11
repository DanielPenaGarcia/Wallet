---
name: reusable-components
description: Reuse and consolidate application components, utilities, schemas, and service logic when creating or changing UI and feature code in this repository. Use when an implementation may repeat an existing interaction, visual pattern, transformation, validation rule, or use case.
---

# Reusable Components

Before adding an implementation, search the relevant module and shared directories for an existing component or function that already owns the behavior.

Prefer these outcomes, in order:

1. Use the existing abstraction without changing it.
2. Extend an existing abstraction when the new behavior belongs to the same responsibility and does not break current callers.
3. Extract a shared abstraction when equivalent code already exists in two or more places, or the requested change immediately needs multiple callers.
4. Keep genuinely unique behavior local instead of creating a speculative generic wrapper.

When extracting shared code:

- Preserve current behavior and accessibility for every migrated caller.
- Give the abstraction semantic options instead of accepting arbitrary styling or domain-specific flags.
- Migrate all equivalent call sites in scope; do not leave parallel implementations behind.
- Keep client-safe components and utilities outside `$lib/server`.
- Run targeted searches after the change to detect obsolete direct implementations.

For user-triggered application actions, use `$lib/components/ui/action-button/ActionButton.svelte`. Choose its semantic `intent` rather than styling the base button directly. Native buttons remain appropriate for navigation controls or primitives that are not application actions.

Validate with `pnpm check` and the smallest relevant build or test command.
