<script lang="ts">
	import { untrack } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { RecurringIncome } from '../../types/recurring-income.types';
	import DeleteRecurringIncomeForm from '../delete-recurring-income-form/DeleteRecurringIncomeForm.svelte';
	import RecurringIncomeForm from '../recurring-income-form/RecurringIncomeForm.svelte';
	import RecurringIncomeList from '../recurring-income-list/RecurringIncomeList.svelte';
	import type { RecurringIncomeSectionProps } from './props';

	let { incomes, feedback = null }: RecurringIncomeSectionProps = $props();
	let createOpen = $state(untrack(() => feedback?.action === 'create-recurring-income' && Boolean(feedback.errors || feedback.message)));
	let editingIncome = $state<RecurringIncome | null>(untrack(() =>
		feedback?.action === 'update-recurring-income'
			? (incomes.find((income) => income.id === feedback.targetId) ?? null)
			: null
	));
	let deletingIncome = $state<RecurringIncome | null>(untrack(() =>
		feedback?.action === 'delete-recurring-income'
			? (incomes.find((income) => income.id === feedback.targetId) ?? null)
			: null
	));
	let editOpen = $state(untrack(() => feedback?.action === 'update-recurring-income' && editingIncome !== null));
	let deleteOpen = $state(untrack(() => feedback?.action === 'delete-recurring-income' && deletingIncome !== null));
</script>

{#if feedback?.success}
	<p class="mb-5 rounded-md border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">{feedback.success}</p>
{/if}

<RecurringIncomeList
	{incomes}
	onCreate={() => (createOpen = true)}
	onEdit={(income) => {
		editingIncome = income;
		editOpen = true;
	}}
	onDelete={(income) => {
		deletingIncome = income;
		deleteOpen = true;
	}}
/>

<Dialog.Root bind:open={createOpen}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
		<Dialog.Header>
			<Dialog.Title>Registrar ingreso recurrente</Dialog.Title>
			<Dialog.Description>Captura la fuente, frecuencia y monto esperado.</Dialog.Description>
		</Dialog.Header>
		<RecurringIncomeForm mode="create" {feedback} onCancel={() => (createOpen = false)} />
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={editOpen}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
		<Dialog.Header>
			<Dialog.Title>Editar ingreso recurrente</Dialog.Title>
			<Dialog.Description>Actualiza los datos del ingreso periódico.</Dialog.Description>
		</Dialog.Header>
		{#if editingIncome}<RecurringIncomeForm mode="edit" income={editingIncome} {feedback} onCancel={() => (editOpen = false)} />{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Eliminar {deletingIncome?.title ?? 'ingreso'}</Dialog.Title>
			<Dialog.Description>Esta acción elimina la configuración del ingreso recurrente.</Dialog.Description>
		</Dialog.Header>
		{#if deletingIncome}<DeleteRecurringIncomeForm income={deletingIncome} {feedback} onCancel={() => (deleteOpen = false)} />{/if}
	</Dialog.Content>
</Dialog.Root>
