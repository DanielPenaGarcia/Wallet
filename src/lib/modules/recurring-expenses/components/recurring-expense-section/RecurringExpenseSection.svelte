<script lang="ts">
	import { untrack } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { RecurringExpense } from '../../types/recurring-expense.types';
	import DeleteRecurringExpenseForm from '../delete-recurring-expense-form/DeleteRecurringExpenseForm.svelte';
	import RecurringExpenseForm from '../recurring-expense-form/RecurringExpenseForm.svelte';
	import RecurringExpenseList from '../recurring-expense-list/RecurringExpenseList.svelte';
	import type { RecurringExpenseSectionProps } from './props';

	let { expenses, categories, paymentAccounts, feedback = null }: RecurringExpenseSectionProps = $props();
	let createOpen = $state(untrack(() => feedback?.action === 'create-recurring-expense' && Boolean(feedback.errors || feedback.message)));
	let editingExpense = $state<RecurringExpense | null>(untrack(() =>
		feedback?.action === 'update-recurring-expense'
			? (expenses.find((expense) => expense.id === feedback.targetId) ?? null)
			: null
	));
	let deletingExpense = $state<RecurringExpense | null>(untrack(() =>
		feedback?.action === 'delete-recurring-expense'
			? (expenses.find((expense) => expense.id === feedback.targetId) ?? null)
			: null
	));
	let editOpen = $state(untrack(() => feedback?.action === 'update-recurring-expense' && editingExpense !== null));
	let deleteOpen = $state(untrack(() => feedback?.action === 'delete-recurring-expense' && deletingExpense !== null));
</script>

{#if feedback?.success}
	<p class="mb-5 rounded-md border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">{feedback.success}</p>
{/if}

<RecurringExpenseList
	{expenses}
	onCreate={() => (createOpen = true)}
	onEdit={(expense) => {
		editingExpense = expense;
		editOpen = true;
	}}
	onDelete={(expense) => {
		deletingExpense = expense;
		deleteOpen = true;
	}}
/>

<Dialog.Root bind:open={createOpen}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
		<Dialog.Header>
			<Dialog.Title>Registrar gasto recurrente</Dialog.Title>
			<Dialog.Description>Captura la categoría, monto y configuración de recurrencia.</Dialog.Description>
		</Dialog.Header>
		<RecurringExpenseForm mode="create" {categories} {paymentAccounts} {feedback} onCancel={() => (createOpen = false)} />
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={editOpen}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
		<Dialog.Header>
			<Dialog.Title>Editar gasto recurrente</Dialog.Title>
			<Dialog.Description>Actualiza la configuración de la obligación periódica.</Dialog.Description>
		</Dialog.Header>
		{#if editingExpense}<RecurringExpenseForm mode="edit" expense={editingExpense} {categories} {paymentAccounts} {feedback} onCancel={() => (editOpen = false)} />{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Eliminar {deletingExpense?.name ?? 'gasto'}</Dialog.Title>
			<Dialog.Description>Esta acción elimina la configuración del gasto recurrente.</Dialog.Description>
		</Dialog.Header>
		{#if deletingExpense}<DeleteRecurringExpenseForm expense={deletingExpense} {feedback} onCancel={() => (deleteOpen = false)} />{/if}
	</Dialog.Content>
</Dialog.Root>
