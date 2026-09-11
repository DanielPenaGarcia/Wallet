<script lang="ts">
	import { untrack } from 'svelte';
	import type {
		MovementClassificationKind,
		MovementPaymentMode
	} from '../../types/movement.types';
	import { toDateTimeLocal } from '$lib/shared/utils/date-time-local';
	import MovementCommonFields from '../movement-common-fields/MovementCommonFields.svelte';
	import MovementExpenseFields from '../movement-expense-fields/MovementExpenseFields.svelte';
	import MovementFormActions from '../movement-form-actions/MovementFormActions.svelte';
	import type { ExpenseMovementFormProps } from './props';

	let {
		mode,
		cards,
		expenses,
		categories,
		movement,
		feedback = null,
		onBack,
		onCancel
	}: ExpenseMovementFormProps = $props();
	let expectedAction = $derived(mode === 'create' ? 'create-movement' : 'update-movement');
	let matchingFeedback = $derived(
		feedback?.action === expectedAction &&
		feedback.values?.type === 'expense' &&
		(mode === 'create' || feedback.targetId === movement?.id)
			? feedback
			: null
	);
	let idPrefix = $derived(mode === 'create' ? 'create-expense-movement' : `edit-movement-${movement?.id ?? ''}`);
	let paymentMode = $state<MovementPaymentMode>(
		untrack(() => matchingFeedback?.values?.paymentMode ?? movement?.paymentMode ?? 'cash')
	);
	let sourceCardId = $state(
		untrack(() => matchingFeedback?.values?.sourceCardId ?? movement?.sourceCardId ?? '')
	);
	let classificationKind = $state<MovementClassificationKind>(
		untrack(() => matchingFeedback?.values?.classificationKind ?? movement?.classificationKind ?? 'category')
	);
	let classificationId = $state(
		untrack(() => matchingFeedback?.values?.classificationId ?? movement?.classificationId ?? '')
	);

	function fieldError(field: string) {
		return matchingFeedback?.errors?.[field]?.[0];
	}
</script>

<form method="POST" action={mode === 'create' ? '?/createMovement' : '?/updateMovement'} class="grid gap-4 sm:grid-cols-2">
	<input type="hidden" name="type" value="expense" />
	{#if mode === 'edit' && movement}<input type="hidden" name="id" value={movement.id} />{/if}
	<MovementCommonFields
		{idPrefix}
		titleValue={matchingFeedback?.values?.title ?? movement?.title ?? ''}
		amountValue={matchingFeedback?.values?.amount ?? (movement ? (movement.amount / 100).toFixed(2) : '')}
		occurredAtValue={matchingFeedback?.values?.occurredAt ?? (movement ? toDateTimeLocal(movement.occurredAt) : '')}
		errors={matchingFeedback?.errors}
	/>
	<MovementExpenseFields
		{idPrefix}
		{cards}
		{expenses}
		{categories}
		errors={matchingFeedback?.errors}
		installmentCountValue={matchingFeedback?.values?.installmentCount ?? movement?.installmentCount ?? ''}
		bind:sourceCardId
		bind:paymentMode
		bind:classificationKind
		bind:classificationId
	/>

	{#if matchingFeedback?.message}<p class="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 sm:col-span-2">{matchingFeedback.message}</p>{/if}
	<MovementFormActions {mode} submitLabel="Guardar movimiento" disabled={cards.length === 0 || (expenses.length === 0 && categories.length === 0)} {onBack} {onCancel} />
</form>
