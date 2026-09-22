<script lang="ts">
	import { untrack } from 'svelte';
	import { toDateTimeLocal } from '$lib/shared/utils/date-time-local';
	import * as Select from '$lib/components/ui/select';
	import { Label } from '$lib/components/ui/label';
	import MovementCardField from '../movement-card-field/MovementCardField.svelte';
	import MovementCommonFields from '../movement-common-fields/MovementCommonFields.svelte';
	import MovementFormActions from '../movement-form-actions/MovementFormActions.svelte';
	import type { AdjustmentMovementFormProps } from './props';

	let { mode, cards, movement, feedback = null, onBack, onCancel }: AdjustmentMovementFormProps = $props();
	let expectedAction = $derived(mode === 'create' ? 'create-movement' : 'update-movement');
	let matchingFeedback = $derived(
		feedback?.action === expectedAction &&
		feedback.values?.type === 'adjustment' &&
		(mode === 'create' || feedback.targetId === movement?.id)
			? feedback
			: null
	);
	let idPrefix = $derived(mode === 'create' ? 'create-adjustment-movement' : `edit-movement-${movement?.id ?? ''}`);
	let direction = $state<'increase' | 'decrease'>(
		untrack(() =>
			matchingFeedback?.values?.adjustmentDirection === 'decrease' || matchingFeedback?.values?.adjustmentDirection === 'increase'
				? matchingFeedback.values.adjustmentDirection
				: movement?.sourceCardId
					? 'decrease'
					: 'increase'
		)
	);
	let accountId = $state(
		untrack(() =>
			matchingFeedback?.values?.adjustmentAccountId ??
			matchingFeedback?.values?.sourceCardId ??
			matchingFeedback?.values?.destinationCardId ??
			movement?.sourceCardId ??
			movement?.destinationCardId ??
			''
		)
	);

	function fieldError(field: string) {
		return matchingFeedback?.errors?.[field]?.[0];
	}
</script>

<form method="POST" action={mode === 'create' ? '?/createMovement' : '?/updateMovement'} class="grid gap-4 sm:grid-cols-2">
	<input type="hidden" name="type" value="adjustment" />
	{#if mode === 'edit' && movement}<input type="hidden" name="id" value={movement.id} />{/if}
	<MovementCommonFields
		{idPrefix}
		titleValue={matchingFeedback?.values?.title ?? movement?.title ?? ''}
		amountValue={matchingFeedback?.values?.amount ?? (movement ? (movement.amount / 100).toFixed(2) : '')}
		occurredAtValue={matchingFeedback?.values?.occurredAt ?? (movement ? toDateTimeLocal(movement.occurredAt) : '')}
		errors={matchingFeedback?.errors}
	/>
	<div class="grid gap-2">
		<Label for={`${idPrefix}-direction`}>Tipo de ajuste</Label>
		<Select.Root type="single" name="adjustmentDirection" required bind:value={direction} items={[{ value: 'increase', label: 'Aumentar saldo' }, { value: 'decrease', label: 'Disminuir saldo' }]}>
			<Select.Trigger id={`${idPrefix}-direction`} class="h-11 w-full border-outline px-3"><span>{direction === 'increase' ? 'Aumentar saldo' : 'Disminuir saldo'}</span></Select.Trigger>
			<Select.Content>
				<Select.Item value="increase" label="Aumentar saldo">Aumentar saldo</Select.Item>
				<Select.Item value="decrease" label="Disminuir saldo">Disminuir saldo</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>
	<MovementCardField id={`${idPrefix}-account`} name="adjustmentAccountId" label="Cuenta afectada" {cards} bind:value={accountId} error={fieldError('sourceAccountId') ?? fieldError('destinationAccountId')} />
	{#if matchingFeedback?.message}<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive sm:col-span-2">{matchingFeedback.message}</p>{/if}
	<MovementFormActions {mode} submitLabel="Guardar ajuste" disabled={cards.length === 0} {onBack} {onCancel} />
</form>
