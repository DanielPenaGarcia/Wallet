<script lang="ts">
	import { untrack } from 'svelte';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import type {
		ExpenseAmountKind,
		ExpenseClassification,
		ExpenseFrequency,
		ExpenseIntervalUnit
	} from '../../types/expense.types';
	import { getCategoryPath } from '../../utils/category-path';
	import {
		expenseClassificationOptions
	} from '../../utils/expense-form-options';
	import ExpenseAmountKindField from '../expense-amount-kind-field/ExpenseAmountKindField.svelte';
	import ExpenseFrequencyField from '../expense-frequency-field/ExpenseFrequencyField.svelte';
	import type { EditExpenseFormProps } from './props';

	let { expense, categories, feedback = null, onCancel }: EditExpenseFormProps = $props();
	let editFeedback = $derived(feedback?.action === 'update-expense' && feedback.targetId === expense.id ? feedback : null);
	let classification = $state<ExpenseClassification>(untrack(() => editFeedback?.values?.classification ?? expense.classification));
	let frequency = $state<ExpenseFrequency>(untrack(() => editFeedback?.values?.frequency ?? expense.frequency));
	let customIntervalCount = $state(
		untrack(() => editFeedback?.values?.customIntervalCount ?? expense.customIntervalCount?.toString() ?? '')
	);
	let customIntervalUnit = $state<ExpenseIntervalUnit | ''>(
		untrack(() => editFeedback?.values?.customIntervalUnit ?? expense.customIntervalUnit ?? '')
	);
	let amountKind = $state<ExpenseAmountKind>(untrack(() => editFeedback?.values?.amountKind ?? expense.amountKind));
	let categoryId = $state(untrack(() => editFeedback?.values?.categoryId ?? expense.categoryId));

	function fieldError(field: string) {
		return editFeedback?.errors?.[field]?.[0];
	}
</script>

<form method="POST" action="?/updateExpense" class="grid gap-4 sm:grid-cols-2">
	<input type="hidden" name="id" value={expense.id} />
	<div class="grid gap-2 sm:col-span-2">
		<Label for="edit-expense-name">Gasto</Label>
		<Input id="edit-expense-name" name="name" required maxlength={80} value={editFeedback?.values?.name ?? expense.name} class="h-11 border-slate-300" aria-invalid={fieldError('name') ? 'true' : undefined} />
		{#if fieldError('name')}<span class="text-xs text-red-700">{fieldError('name')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<Label for="edit-expense-classification">Clasificación</Label>
		<Select.Root type="single" name="classification" required bind:value={classification} items={expenseClassificationOptions}>
			<Select.Trigger id="edit-expense-classification" class="h-11 w-full border-slate-300 px-3"><span>{expenseClassificationOptions.find((item) => item.value === classification)?.label}</span></Select.Trigger>
			<Select.Content>{#each expenseClassificationOptions as option}<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>{/each}</Select.Content>
		</Select.Root>
	</div>
	<ExpenseFrequencyField
		idPrefix="edit-expense"
		bind:frequency
		bind:customIntervalCount
		bind:customIntervalUnit
		frequencyError={fieldError('frequency')}
		customIntervalCountError={fieldError('customIntervalCount')}
		customIntervalUnitError={fieldError('customIntervalUnit')}
	/>
	<div class="grid gap-2 sm:col-span-2">
		<Label for="edit-expense-category">Categoría</Label>
		<Select.Root type="single" name="categoryId" required bind:value={categoryId} items={categories.map((category) => ({ value: category.id, label: getCategoryPath(category, categories) }))}>
			<Select.Trigger id="edit-expense-category" class="h-11 w-full border-slate-300 px-3"><span class="truncate">{getCategoryPath(categories.find((item) => item.id === categoryId), categories)}</span></Select.Trigger>
			<Select.Content>{#each categories as category}<Select.Item value={category.id} label={getCategoryPath(category, categories)}>{getCategoryPath(category, categories)}</Select.Item>{/each}</Select.Content>
		</Select.Root>
	</div>
	<div class="grid gap-2">
		<Label for="edit-expense-amount">Cantidad</Label>
		<Input id="edit-expense-amount" name="amount" required type="number" min="0.01" step="0.01" value={editFeedback?.values?.amount ?? (expense.amount / 100).toFixed(2)} class="h-11 border-slate-300" aria-invalid={fieldError('amount') ? 'true' : undefined} />
		{#if fieldError('amount')}<span class="text-xs text-red-700">{fieldError('amount')}</span>{/if}
	</div>
	<ExpenseAmountKindField id="edit-expense-amount-kind" bind:value={amountKind} error={fieldError('amountKind')} />
	<div class="grid gap-2">
		<Label for="edit-expense-currency">Moneda</Label>
		<Input id="edit-expense-currency" name="currencyCode" required maxlength={3} value={editFeedback?.values?.currencyCode ?? expense.currencyCode} class="h-11 border-slate-300 uppercase" aria-invalid={fieldError('currencyCode') ? 'true' : undefined} />
		{#if fieldError('currencyCode')}<span class="text-xs text-red-700">{fieldError('currencyCode')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<Label for="edit-expense-statement-day">Día de corte</Label>
		<Input id="edit-expense-statement-day" name="statementDay" type="number" min="1" max="31" step="1" value={editFeedback?.values?.statementDay ?? expense.statementDay ?? ''} placeholder="Ej. 14" class="h-11 border-slate-300" aria-invalid={fieldError('statementDay') ? 'true' : undefined} />
		{#if fieldError('statementDay')}<span class="text-xs text-red-700">{fieldError('statementDay')}</span>{/if}
	</div>
	<div class="grid gap-2">
		<Label for="edit-expense-payment-due-day">Día límite de pago</Label>
		<Input id="edit-expense-payment-due-day" name="paymentDueDay" type="number" min="1" max="31" step="1" value={editFeedback?.values?.paymentDueDay ?? expense.paymentDueDay ?? ''} placeholder="Ej. 3" class="h-11 border-slate-300" aria-invalid={fieldError('paymentDueDay') ? 'true' : undefined} />
		{#if fieldError('paymentDueDay')}<span class="text-xs text-red-700">{fieldError('paymentDueDay')}</span>{/if}
	</div>
	{#if editFeedback?.message}<p class="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 sm:col-span-2">{editFeedback.message}</p>{/if}
	<div class="flex justify-end gap-2 sm:col-span-2">
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit">Guardar cambios</ActionButton>
	</div>
</form>
