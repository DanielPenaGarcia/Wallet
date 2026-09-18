<script lang="ts">
	import { untrack } from 'svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import CardSelectField from '$lib/modules/cards/components/card-select-field/CardSelectField.svelte';
	import * as Select from '$lib/components/ui/select';
	import { currentDateTimeLocal } from '$lib/shared/utils/date-time-local';
	import { formatExpenseAmount } from '../../utils/format-expense-amount';
	import type { PayExpenseFormProps } from './props';
	import { isPayExpenseFormValues } from './props';

	let { expense, cards, feedback = null, onCancel }: PayExpenseFormProps = $props();
	let payFeedback = $derived(feedback?.action === 'pay-expense' && feedback.targetId === expense.id ? feedback : null);
	let values = $derived(isPayExpenseFormValues(payFeedback?.values) ? payFeedback.values : null);
	let mode = $state<'paid' | 'card'>(untrack(() => values?.mode ?? 'paid'));
	let cardId = $state(untrack(() => values?.cardId ?? ''));

	function fieldError(field: string) {
		return payFeedback?.errors?.[field]?.[0];
	}
</script>

<form method="POST" action="?/payExpense" class="grid gap-4">
	<input type="hidden" name="expenseId" value={expense.id} />

	<div class="rounded-md border border-outline bg-surface-subtle px-3 py-3">
		<p class="font-bold text-on-surface">{expense.name}</p>
		<p class="mt-1 text-sm text-on-surface-muted">
			{formatExpenseAmount(expense.amount, expense.currencyCode, expense.amountKind)}
		</p>
	</div>

	<div class="grid gap-2">
		<Label for={`pay-expense-${expense.id}-mode`}>Acción</Label>
		<Select.Root
			type="single"
			name="mode"
			required
			bind:value={mode}
			items={[{ value: 'paid', label: 'Pagado' }, { value: 'card', label: 'Pagar utilizando una cuenta' }]}
		>
			<Select.Trigger id={`pay-expense-${expense.id}-mode`} class="h-11 w-full border-outline px-3">
				<span>{mode === 'card' ? 'Pagar utilizando una cuenta' : 'Pagado'}</span>
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="paid" label="Pagado">Pagado</Select.Item>
				<Select.Item value="card" label="Pagar utilizando una cuenta">Pagar utilizando una cuenta</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>

	<div class="grid gap-2 sm:grid-cols-2">
		<div class="grid gap-2">
			<Label for={`pay-expense-${expense.id}-amount`}>Monto pagado</Label>
			<Input
				id={`pay-expense-${expense.id}-amount`}
				name="amount"
				type="number"
				min="0.01"
				step="0.01"
				required
				value={values?.amount ?? (expense.amount / 100).toFixed(2)}
				class="h-11 border-outline"
				aria-invalid={fieldError('amount') ? 'true' : undefined}
			/>
			{#if fieldError('amount')}<span class="text-xs text-destructive">{fieldError('amount')}</span>{/if}
		</div>

		<div class="grid gap-2">
			<Label for={`pay-expense-${expense.id}-paid-at`}>Fecha de pago</Label>
			<Input
				id={`pay-expense-${expense.id}-paid-at`}
				name="paidAt"
				type="datetime-local"
				required
				value={values?.paidAt ?? currentDateTimeLocal()}
				class="h-11 border-outline"
				aria-invalid={fieldError('paidAt') ? 'true' : undefined}
			/>
			{#if fieldError('paidAt')}<span class="text-xs text-destructive">{fieldError('paidAt')}</span>{/if}
		</div>
	</div>

	{#if mode === 'card'}
		<CardSelectField
			id={`pay-expense-${expense.id}-card`}
			name="cardId"
			label="Cuenta"
			{cards}
			bind:value={cardId}
			error={fieldError('cardId')}
			placeholder="Selecciona una cuenta"
		/>
	{/if}

	<div class="grid gap-2">
		<Label for={`pay-expense-${expense.id}-note`}>Nota</Label>
		<Input
			id={`pay-expense-${expense.id}-note`}
			name="note"
			maxlength={180}
			value={values?.note ?? ''}
			placeholder={mode === 'card' ? 'Ej. Cargo domiciliado' : 'Ej. Se cobró en efectivo o nómina'}
			class="h-11 border-outline"
			aria-invalid={fieldError('note') ? 'true' : undefined}
		/>
		{#if fieldError('note')}<span class="text-xs text-destructive">{fieldError('note')}</span>{/if}
	</div>

	{#if payFeedback?.message}
		<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{payFeedback.message}</p>
	{/if}

	<div class="flex justify-end gap-2">
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit">{mode === 'card' ? 'Pagar y registrar' : 'Marcar pagado'}</ActionButton>
	</div>
</form>
