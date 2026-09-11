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
	import type { CreateExpenseFormProps } from './props';

	let { categories, feedback = null }: CreateExpenseFormProps = $props();
	let createFeedback = $derived(feedback?.action === 'create-expense' ? feedback : null);
	let classification = $state<ExpenseClassification>(
		untrack(() => createFeedback?.values?.classification ?? 'necessity')
	);
	let frequency = $state<ExpenseFrequency>(
		untrack(() => createFeedback?.values?.frequency ?? 'monthly')
	);
	let customIntervalCount = $state(
		untrack(() => createFeedback?.values?.customIntervalCount ?? '')
	);
	let customIntervalUnit = $state<ExpenseIntervalUnit | ''>(
		untrack(() => createFeedback?.values?.customIntervalUnit ?? '')
	);
	let amountKind = $state<ExpenseAmountKind>(
		untrack(() => createFeedback?.values?.amountKind ?? 'fixed')
	);
	let categoryId = $state(untrack(() => createFeedback?.values?.categoryId ?? ''));

	let selectedClassification = $derived(
		expenseClassificationOptions.find((option) => option.value === classification)?.label ?? 'Selecciona una clasificación'
	);
	let selectedCategory = $derived(
		categoryId ? getCategoryPath(categories.find((category) => category.id === categoryId), categories) : 'Selecciona una categoría'
	);

	function fieldError(field: string) {
		return createFeedback?.errors?.[field]?.[0];
	}
</script>

<form method="POST" action="?/createExpense" class="grid gap-4 sm:grid-cols-2">
	<div class="grid gap-2 sm:col-span-2">
		<Label for="expense-name">Gasto</Label>
		<Input id="expense-name" name="name" required maxlength={80} value={createFeedback?.values?.name ?? ''} placeholder="Ej. Renta" class="h-11 border-slate-300" aria-invalid={fieldError('name') ? 'true' : undefined} />
		{#if fieldError('name')}<span class="text-xs text-red-700">{fieldError('name')}</span>{/if}
	</div>

	<div class="grid gap-2">
		<Label for="expense-classification">Clasificación</Label>
		<Select.Root type="single" name="classification" required bind:value={classification} items={expenseClassificationOptions}>
			<Select.Trigger id="expense-classification" class="h-11 w-full border-slate-300 px-3"><span>{selectedClassification}</span></Select.Trigger>
			<Select.Content>{#each expenseClassificationOptions as option}<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>{/each}</Select.Content>
		</Select.Root>
	</div>

	<ExpenseFrequencyField
		idPrefix="expense"
		bind:frequency
		bind:customIntervalCount
		bind:customIntervalUnit
		frequencyError={fieldError('frequency')}
		customIntervalCountError={fieldError('customIntervalCount')}
		customIntervalUnitError={fieldError('customIntervalUnit')}
	/>

	<div class="grid gap-2 sm:col-span-2">
		<Label for="expense-category">Categoría</Label>
		<Select.Root type="single" name="categoryId" required bind:value={categoryId} items={categories.map((category) => ({ value: category.id, label: getCategoryPath(category, categories) }))}>
			<Select.Trigger id="expense-category" class="h-11 w-full border-slate-300 px-3" aria-invalid={fieldError('categoryId') ? 'true' : undefined}><span class="truncate">{selectedCategory}</span></Select.Trigger>
			<Select.Content>
				{#each categories as category}<Select.Item value={category.id} label={getCategoryPath(category, categories)}>{getCategoryPath(category, categories)}</Select.Item>{/each}
			</Select.Content>
		</Select.Root>
		{#if fieldError('categoryId')}<span class="text-xs text-red-700">{fieldError('categoryId')}</span>{/if}
	</div>

	<div class="grid gap-2">
		<Label for="expense-amount">Cantidad</Label>
		<Input id="expense-amount" name="amount" required type="number" min="0.01" step="0.01" value={createFeedback?.values?.amount ?? ''} placeholder="0.00" class="h-11 border-slate-300" aria-invalid={fieldError('amount') ? 'true' : undefined} />
		{#if fieldError('amount')}<span class="text-xs text-red-700">{fieldError('amount')}</span>{/if}
	</div>

	<ExpenseAmountKindField id="expense-amount-kind" bind:value={amountKind} error={fieldError('amountKind')} />

	<div class="grid gap-2">
		<Label for="expense-currency">Moneda</Label>
		<Input id="expense-currency" name="currencyCode" required maxlength={3} value={createFeedback?.values?.currencyCode ?? 'MXN'} class="h-11 border-slate-300 uppercase" aria-invalid={fieldError('currencyCode') ? 'true' : undefined} />
		{#if fieldError('currencyCode')}<span class="text-xs text-red-700">{fieldError('currencyCode')}</span>{/if}
	</div>

	<div class="grid gap-2">
		<Label for="expense-statement-day">Día de corte</Label>
		<Input id="expense-statement-day" name="statementDay" type="number" min="1" max="31" step="1" value={createFeedback?.values?.statementDay ?? ''} placeholder="Ej. 14" class="h-11 border-slate-300" aria-invalid={fieldError('statementDay') ? 'true' : undefined} />
		{#if fieldError('statementDay')}<span class="text-xs text-red-700">{fieldError('statementDay')}</span>{/if}
	</div>

	<div class="grid gap-2">
		<Label for="expense-payment-due-day">Día límite de pago</Label>
		<Input id="expense-payment-due-day" name="paymentDueDay" type="number" min="1" max="31" step="1" value={createFeedback?.values?.paymentDueDay ?? ''} placeholder="Ej. 3" class="h-11 border-slate-300" aria-invalid={fieldError('paymentDueDay') ? 'true' : undefined} />
		{#if fieldError('paymentDueDay')}<span class="text-xs text-red-700">{fieldError('paymentDueDay')}</span>{/if}
	</div>

	{#if createFeedback?.message}<p class="text-sm font-semibold text-red-700 sm:col-span-2">{createFeedback.message}</p>{/if}
	<div class="flex justify-end sm:col-span-2">
		<ActionButton type="submit" disabled={categories.length === 0}>Guardar gasto</ActionButton>
	</div>
</form>
