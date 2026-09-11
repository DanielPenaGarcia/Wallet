# Repository instructions

Use the `reusable-components` skill whenever application UI or feature logic is created or changed.

Before introducing a component, utility, schema, mapper, service, repository method, or repeated interaction, search for an existing implementation and reuse or extend it when the responsibility matches. Do not create speculative abstractions for behavior that is genuinely unique.

For changes that add a shared abstraction or touch equivalent behavior in multiple modules, delegate a read-only reuse audit to the project agent `reuse_reviewer` before completing the task. Address concrete duplication findings or explain why the implementations must remain separate.

Use `ActionButton` for user-triggered application actions. Keep native buttons for navigation controls and low-level UI primitives.
