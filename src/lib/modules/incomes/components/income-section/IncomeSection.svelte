<script lang="ts">
	import { untrack } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { JobIncome } from '../../types/job-income.types';
	import CreateJobIncomeForm from '../create-job-income-form/CreateJobIncomeForm.svelte';
	import DeleteJobIncomeForm from '../delete-job-income-form/DeleteJobIncomeForm.svelte';
	import EditJobIncomeForm from '../edit-job-income-form/EditJobIncomeForm.svelte';
	import JobIncomeList from '../job-income-list/JobIncomeList.svelte';
	import type { IncomeSectionProps } from './props';

	let { incomes, feedback = null }: IncomeSectionProps = $props();
	let createOpen = $state(untrack(() => feedback?.action === 'create-income' && Boolean(feedback.errors || feedback.message)));
	let editingIncome = $state<JobIncome | null>(untrack(() => feedback?.action === 'update-income' ? (incomes.find((income) => income.id === feedback.targetId) ?? null) : null));
	let deletingIncome = $state<JobIncome | null>(untrack(() => feedback?.action === 'delete-income' ? (incomes.find((income) => income.id === feedback.targetId) ?? null) : null));
	let editOpen = $state(untrack(() => feedback?.action === 'update-income' && editingIncome !== null));
	let deleteOpen = $state(untrack(() => feedback?.action === 'delete-income' && deletingIncome !== null));

	function editIncome(income: JobIncome) {
		editingIncome = income;
		editOpen = true;
	}

	function confirmDeleteIncome(income: JobIncome) {
		deletingIncome = income;
		deleteOpen = true;
	}
</script>

{#if feedback?.success}
	<p class="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{feedback.success}</p>
{/if}

<div>
	<JobIncomeList {incomes} onCreate={() => (createOpen = true)} onEdit={editIncome} onDelete={confirmDeleteIncome} />
</div>

<Dialog.Root bind:open={createOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Nuevo ingreso recurrente</Dialog.Title>
			<Dialog.Description>Registra la ganancia mensual de un trabajo.</Dialog.Description>
		</Dialog.Header>
		<CreateJobIncomeForm {feedback} />
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={editOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Editar ingreso</Dialog.Title>
			<Dialog.Description>Actualiza los datos del trabajo y su ganancia mensual.</Dialog.Description>
		</Dialog.Header>
		{#if editingIncome}<EditJobIncomeForm income={editingIncome} {feedback} onCancel={() => (editOpen = false)} />{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Eliminar {deletingIncome?.jobName ?? 'ingreso'}</Dialog.Title>
			<Dialog.Description>Esta acción es lógica y no elimina el historial guardado.</Dialog.Description>
		</Dialog.Header>
		{#if deletingIncome}<DeleteJobIncomeForm income={deletingIncome} {feedback} onCancel={() => (deleteOpen = false)} />{/if}
	</Dialog.Content>
</Dialog.Root>
