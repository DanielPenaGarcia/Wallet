<script lang="ts">
	import { untrack } from 'svelte';
	import { toDateTimeLocal } from '$lib/shared/utils/date-time-local';
	import MovementCardField from '../movement-card-field/MovementCardField.svelte';
	import MovementCommonFields from '../movement-common-fields/MovementCommonFields.svelte';
	import MovementFormActions from '../movement-form-actions/MovementFormActions.svelte';
	import type { TransferMovementFormProps } from './props';

	let {
		mode,
		movementType = 'transfer',
		cards,
		sourceCards = cards,
		destinationCards = cards,
		movement,
		feedback = null,
		onBack,
		onCancel
	}: TransferMovementFormProps = $props();
	let expectedAction = $derived(mode === 'create' ? 'create-movement' : 'update-movement');
	let matchingFeedback = $derived(
		feedback?.action === expectedAction &&
		feedback.values?.type === movementType &&
		(mode === 'create' || feedback.targetId === movement?.id)
			? feedback
			: null
	);
	let idPrefix = $derived(mode === 'create' ? `create-${movementType}-movement` : `edit-movement-${movement?.id ?? ''}`);
	let sourceCardId = $state(
		untrack(() => matchingFeedback?.values?.sourceCardId ?? movement?.sourceCardId ?? '')
	);
	let destinationCardId = $state(
		untrack(() => matchingFeedback?.values?.destinationCardId ?? movement?.destinationCardId ?? '')
	);

	function fieldError(field: string) {
		return matchingFeedback?.errors?.[field]?.[0];
	}
</script>

<form method="POST" action={mode === 'create' ? '?/createMovement' : '?/updateMovement'} class="grid gap-4 sm:grid-cols-2">
	<input type="hidden" name="type" value={movementType} />
	{#if mode === 'edit' && movement}<input type="hidden" name="id" value={movement.id} />{/if}
	<MovementCommonFields
		{idPrefix}
		titleValue={matchingFeedback?.values?.title ?? movement?.title ?? ''}
		amountValue={matchingFeedback?.values?.amount ?? (movement ? (movement.amount / 100).toFixed(2) : '')}
		occurredAtValue={matchingFeedback?.values?.occurredAt ?? (movement ? toDateTimeLocal(movement.occurredAt) : '')}
		errors={matchingFeedback?.errors}
	/>
	<MovementCardField id={`${idPrefix}-source-card`} name="sourceCardId" label="Cuenta de origen" cards={sourceCards} bind:value={sourceCardId} error={fieldError('sourceCardId')} />
	<MovementCardField id={`${idPrefix}-destination-card`} name="destinationCardId" label="Cuenta de destino" cards={destinationCards} bind:value={destinationCardId} error={fieldError('destinationCardId')} />
	{#if matchingFeedback?.message}<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive sm:col-span-2">{matchingFeedback.message}</p>{/if}
	<MovementFormActions {mode} submitLabel={movementType === 'credit_card_payment' ? 'Guardar pago' : 'Guardar transferencia'} disabled={sourceCards.length === 0 || destinationCards.length === 0} {onBack} {onCancel} />
</form>
