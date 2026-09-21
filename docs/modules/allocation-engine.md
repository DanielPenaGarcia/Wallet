# Allocation Engine

The Allocation Engine is the future decision core for distributing available money across obligations.

It must remain a pure, deterministic domain module.

## Boundary

The engine receives plain data structures and returns plain allocation results.

It must not import or depend on:

- SvelteKit.
- `Request`, `RequestEvent`, `FormData`, cookies, params, or URLs.
- Drizzle.
- SQLite.
- Repositories.
- Browser APIs.

## Inputs

Inputs should already be normalized by callers.

Core input shape:

```ts
export type AllocationInput = {
	availableAmountCents: number;
	obligations: AllocationObligation[];
};
```

An obligation should expose only the fields the engine needs:

```ts
export type AllocationObligation = {
	id: string;
	type: 'recurring_expense' | 'credit_card' | 'goal' | 'commitment' | 'reserve' | 'other';
	name: string;
	requiredAmountCents: number;
	priority: number;
	isEssential: boolean;
	dueDate: string | null;
	isActive: boolean;
};
```

## Outputs

The engine returns deterministic results without side effects:

```ts
export type AllocationResult = {
	initialAmountCents: number;
	remainingAmountCents: number;
	allocations: AllocationLine[];
};

export type AllocationLine = {
	obligationId: string;
	allocatedAmountCents: number;
	status: 'covered' | 'partial' | 'unfunded';
};
```

## Rules

- The engine never allocates more than `availableAmountCents`.
- Inactive obligations are ignored.
- Required amounts cannot be negative.
- Partial allocation is allowed when available money is insufficient.
- Higher-priority obligations are funded before lower-priority obligations.
- Essential obligations can outrank optional obligations when priorities tie.
- Date-aware rules must be deterministic and based on explicit input dates.
- The engine must not persist allocation results by itself.

## Testing

The engine should have unit tests for:

- Priority ordering.
- Essential obligation ordering.
- Partial allocation.
- Zero available money.
- Ignoring inactive obligations.
- Never allocating more than the available amount.
- Stable output for the same input.

## Placement

When implemented, keep the pure engine in a client-safe module such as:

```text
src/lib/modules/allocation-engine/
|-- types/
|-- utils/
`-- allocation-engine.test.ts
```

Server services may adapt database records into engine inputs, but the engine itself must not know where data came from.
