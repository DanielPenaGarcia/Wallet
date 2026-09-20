<script lang="ts">
	import { untrack } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { availableGoalDistribution } from '../../utils/goal-distribution';
	import type { FinancialGoal } from '../../types/financial-goal.types';
	import DeleteFinancialGoalForm from '../delete-financial-goal-form/DeleteFinancialGoalForm.svelte';
	import FinancialGoalForm from '../financial-goal-form/FinancialGoalForm.svelte';
	import FinancialGoalList from '../financial-goal-list/FinancialGoalList.svelte';
	import type { FinancialGoalSectionProps } from './props';

	let { goals, planningPeriods = [], feedback = null }: FinancialGoalSectionProps = $props();
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
	let createAvailableDistributionPercentage = $derived(distributionAvailableForGoal());
	let editAvailableDistributionPercentage = $derived(distributionAvailableForGoal(editingGoal?.id));

	function editGoal(goal: FinancialGoal) {
		editingGoal = goal;
		editOpen = true;
	}

	function confirmDeleteGoal(goal: FinancialGoal) {
		deletingGoal = goal;
		deleteOpen = true;
	}

	function distributionAvailableForGoal(ignoredGoalId?: string) {
		return availableGoalDistribution(goals, ignoredGoalId);
	}
</script>

{#if feedback?.success}
	<p class="mb-5 rounded-md border border-secondary/20 bg-secondary/10 px-4 py-3 text-sm font-semibold text-secondary">{feedback.success}</p>
{/if}

<FinancialGoalList
	{goals}
	{planningPeriods}
	onCreate={() => (createOpen = true)}
	onEdit={editGoal}
	onDelete={confirmDeleteGoal}
/>

<Dialog.Root bind:open={createOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Nueva meta</Dialog.Title>
			<Dialog.Description>Define qué quieres conseguir y qué porcentaje del dinero libre deseas dirigir.</Dialog.Description>
		</Dialog.Header>
		<FinancialGoalForm
			mode="create"
			availableDistributionPercentage={createAvailableDistributionPercentage}
			{planningPeriods}
			{feedback}
			onCancel={() => (createOpen = false)}
		/>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={editOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Editar meta</Dialog.Title>
			<Dialog.Description>Actualiza el avance, prioridad, estado o distribución de la meta.</Dialog.Description>
		</Dialog.Header>
		{#if editingGoal}
			<FinancialGoalForm
				mode="edit"
				goal={editingGoal}
				availableDistributionPercentage={editAvailableDistributionPercentage}
				{planningPeriods}
				{feedback}
				onCancel={() => (editOpen = false)}
			/>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Eliminar {deletingGoal?.name ?? 'meta'}</Dialog.Title>
			<Dialog.Description>Esta acción elimina la configuración de la meta.</Dialog.Description>
		</Dialog.Header>
		{#if deletingGoal}
			<DeleteFinancialGoalForm goal={deletingGoal} {feedback} onCancel={() => (deleteOpen = false)} />
		{/if}
	</Dialog.Content>
</Dialog.Root>
