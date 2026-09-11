<script lang="ts">
	import { untrack } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { FinancialGoal } from '../../types/financial-goal.types';
	import DeleteFinancialGoalForm from '../delete-financial-goal-form/DeleteFinancialGoalForm.svelte';
	import FinancialGoalForm from '../financial-goal-form/FinancialGoalForm.svelte';
	import FinancialGoalList from '../financial-goal-list/FinancialGoalList.svelte';
	import type { FinancialGoalSectionProps } from './props';

	let { goals, feedback = null }: FinancialGoalSectionProps = $props();
	let createOpen = $state(
		untrack(() => feedback?.action === 'create-goal' && Boolean(feedback.errors || feedback.message))
	);
	let editingGoal = $state<FinancialGoal | null>(
		untrack(() =>
			feedback?.action === 'update-goal'
				? (goals.find((goal) => goal.id === feedback.targetId) ?? null)
				: null
		)
	);
	let deletingGoal = $state<FinancialGoal | null>(
		untrack(() =>
			feedback?.action === 'delete-goal'
				? (goals.find((goal) => goal.id === feedback.targetId) ?? null)
				: null
		)
	);
	let editOpen = $state(untrack(() => feedback?.action === 'update-goal' && editingGoal !== null));
	let deleteOpen = $state(untrack(() => feedback?.action === 'delete-goal' && deletingGoal !== null));

	function editGoal(goal: FinancialGoal) {
		editingGoal = goal;
		editOpen = true;
	}

	function confirmDeleteGoal(goal: FinancialGoal) {
		deletingGoal = goal;
		deleteOpen = true;
	}
</script>

{#if feedback?.success}
	<p class="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{feedback.success}</p>
{/if}

<FinancialGoalList
	{goals}
	onCreate={() => (createOpen = true)}
	onEdit={editGoal}
	onDelete={confirmDeleteGoal}
/>

<Dialog.Root bind:open={createOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Nuevo objetivo</Dialog.Title>
			<Dialog.Description>Define qué quieres conseguir y qué parte de tus ingresos asignarás.</Dialog.Description>
		</Dialog.Header>
		<FinancialGoalForm mode="create" {feedback} />
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={editOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Editar objetivo</Dialog.Title>
			<Dialog.Description>Actualiza la meta y su porcentaje de asignación.</Dialog.Description>
		</Dialog.Header>
		{#if editingGoal}
			<FinancialGoalForm mode="edit" goal={editingGoal} {feedback} onCancel={() => (editOpen = false)} />
		{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Eliminar {deletingGoal?.name ?? 'objetivo'}</Dialog.Title>
			<Dialog.Description>El registro se conservará para mantener el historial.</Dialog.Description>
		</Dialog.Header>
		{#if deletingGoal}
			<DeleteFinancialGoalForm goal={deletingGoal} {feedback} onCancel={() => (deleteOpen = false)} />
		{/if}
	</Dialog.Content>
</Dialog.Root>
