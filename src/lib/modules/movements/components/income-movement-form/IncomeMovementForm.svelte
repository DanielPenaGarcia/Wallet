<script lang="ts">
	import { untrack } from 'svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toDateTimeLocal } from '$lib/shared/utils/date-time-local';
	import MovementCardField from '../movement-card-field/MovementCardField.svelte';
	import MovementCommonFields from '../movement-common-fields/MovementCommonFields.svelte';
	import MovementFormActions from '../movement-form-actions/MovementFormActions.svelte';
	import type { IncomeMovementFormProps } from './props';

	let { mode, cards, movement, feedback = null, onBack, onCancel }: IncomeMovementFormProps = $props();
	let expectedAction = $derived(mode === 'create' ? 'create-movement' : 'update-movement');
	let matchingFeedback = $derived(
		feedback?.action === expectedAction &&
		feedback.values?.type === 'income' &&
		(mode === 'create' || feedback.targetId === movement?.id)
			? feedback
			: null
	);
	let idPrefix = $derived(mode === 'create' ? 'create-income-movement' : `edit-movement-${movement?.id ?? ''}`);
	let destinationCardId = $state(
		untrack(() => matchingFeedback?.values?.destinationCardId ?? movement?.destinationCardId ?? '')
	);

	function fieldError(field: string) {
		return matchingFeedback?.errors?.[field]?.[0];
	}
</script>

<form method="POST" action={mode === 'create' ? '?/createMovement' : '?/updateMovement'} class="grid gap-4 sm:grid-cols-2">
	<input type="hidden" name="type" value="income" />
	{#if mode === 'edit' && movement}<input type="hidden" name="id" value={movement.id} />{/if}
	<MovementCommonFields
		{idPrefix}
		titleValue={matchingFeedback?.values?.title ?? movement?.title ?? ''}
		amountValue={matchingFeedback?.values?.amount ?? (movement ? (movement.amount / 100).toFixed(2) : '')}
		occurredAtValue={matchingFeedback?.values?.occurredAt ?? (movement ? toDateTimeLocal(movement.occurredAt) : '')}
		errors={matchingFeedback?.errors}
	/>
	<div class="grid gap-2 sm:col-span-2">
		<Label for={`${idPrefix}-reason`}>Razón del ingreso</Label>
		<Input id={`${idPrefix}-reason`} name="reason" required maxlength={160} value={matchingFeedback?.values?.reason ?? movement?.reason ?? ''} placeholder="Ej. Pago de nómina" class="h-11 border-outline" aria-invalid={fieldError('reason') ? 'true' : undefined} />
		{#if fieldError('reason')}<span class="text-xs text-destructive">{fieldError('reason')}</span>{/if}
	</div>
	<MovementCardField id={`${idPrefix}-destination-card`} name="destinationCardId" label="Cuenta de destino" {cards} bind:value={destinationCardId} error={fieldError('destinationCardId')} />
	{#if matchingFeedback?.message}<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive sm:col-span-2">{matchingFeedback.message}</p>{/if}
	<MovementFormActions {mode} submitLabel="Guardar movimiento" disabled={cards.length === 0} {onBack} {onCancel} />
</form>
