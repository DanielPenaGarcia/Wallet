<script lang="ts">
	import { untrack } from 'svelte';
	import { toDateTimeLocal } from '$lib/shared/utils/date-time-local';
	import MovementCardField from '../movement-card-field/MovementCardField.svelte';
	import MovementCommonFields from '../movement-common-fields/MovementCommonFields.svelte';
	import MovementFormActions from '../movement-form-actions/MovementFormActions.svelte';
	import type { TransferMovementFormProps } from './props';

	let { mode, cards, movement, feedback = null, onBack, onCancel }: TransferMovementFormProps = $props();
	let expectedAction = $derived(mode === 'create' ? 'create-movement' : 'update-movement');
	let matchingFeedback = $derived(
		feedback?.action === expectedAction &&
		feedback.values?.type === 'transfer' &&
		(mode === 'create' || feedback.targetId === movement?.id)
			? feedback
			: null
	);
	let idPrefix = $derived(mode === 'create' ? 'create-transfer-movement' : `edit-movement-${movement?.id ?? ''}`);
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
	<input type="hidden" name="type" value="transfer" />
	{#if mode === 'edit' && movement}<input type="hidden" name="id" value={movement.id} />{/if}
	<MovementCommonFields
		{idPrefix}
		titleValue={matchingFeedback?.values?.title ?? movement?.title ?? ''}
		amountValue={matchingFeedback?.values?.amount ?? (movement ? (movement.amount / 100).toFixed(2) : '')}
		occurredAtValue={matchingFeedback?.values?.occurredAt ?? (movement ? toDateTimeLocal(movement.occurredAt) : '')}
		errors={matchingFeedback?.errors}
	/>
	<MovementCardField id={`${idPrefix}-source-card`} name="sourceCardId" label="Cuenta de origen" {cards} bind:value={sourceCardId} error={fieldError('sourceCardId')} />
	<MovementCardField id={`${idPrefix}-destination-card`} name="destinationCardId" label="Cuenta de destino" {cards} bind:value={destinationCardId} error={fieldError('destinationCardId')} />
	{#if matchingFeedback?.message}<p class="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 sm:col-span-2">{matchingFeedback.message}</p>{/if}
	<MovementFormActions {mode} submitLabel="Guardar transferencia" disabled={cards.length < 2} {onBack} {onCancel} />
</form>
