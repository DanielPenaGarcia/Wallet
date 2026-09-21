<script lang="ts">
	import { untrack } from 'svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { toDateTimeLocal } from '$lib/shared/utils/date-time-local';
	import MovementCardField from '../movement-card-field/MovementCardField.svelte';
	import MovementCommonFields from '../movement-common-fields/MovementCommonFields.svelte';
	import MovementFormActions from '../movement-form-actions/MovementFormActions.svelte';
	import type { IncomeMovementFormProps } from './props';

	const noRecurringIncomeValue = 'none';

	let { mode, cards, incomes, movement, feedback = null, onBack, onCancel }: IncomeMovementFormProps = $props();
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
	let recurringIncomeId = $state(
		untrack(() => matchingFeedback?.values?.recurringIncomeId ?? movement?.classificationId ?? noRecurringIncomeValue)
	);
	let recurringIncomeItems = $derived([
		{ value: noRecurringIncomeValue, label: 'Sin ingreso recurrente' },
		...incomes.map((income) => ({ value: income.id, label: income.title }))
	]);
	let selectedRecurringIncomeLabel = $derived(
		recurringIncomeItems.find((item) => item.value === recurringIncomeId)?.label ?? 'Sin ingreso recurrente'
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
	<div class="grid gap-2 sm:col-span-2">
		<Label for={`${idPrefix}-recurring-income`}>Ingreso recurrente</Label>
		<Select.Root type="single" name="recurringIncomeId" bind:value={recurringIncomeId} items={recurringIncomeItems}>
			<Select.Trigger id={`${idPrefix}-recurring-income`} class="h-11 w-full border-outline px-3" aria-invalid={fieldError('recurringIncomeId') ? 'true' : undefined}>
				<span class="truncate">{selectedRecurringIncomeLabel}</span>
			</Select.Trigger>
			<Select.Content>
				<Select.Item value={noRecurringIncomeValue} label="Sin ingreso recurrente">Sin ingreso recurrente</Select.Item>
				{#each incomes as income (income.id)}
					<Select.Item value={income.id} label={income.title}>{income.title}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
		{#if fieldError('recurringIncomeId')}<span class="text-xs text-destructive">{fieldError('recurringIncomeId')}</span>{/if}
	</div>
	{#if matchingFeedback?.message}<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive sm:col-span-2">{matchingFeedback.message}</p>{/if}
	<MovementFormActions {mode} submitLabel="Guardar movimiento" disabled={cards.length === 0} {onBack} {onCancel} />
</form>
