<script lang="ts">
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TargetIcon from '@lucide/svelte/icons/target';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { ActionButton } from '$lib/components/ui/action-button';
	import {
		formatEstimatedCompletionDate,
		formatEstimatedPeriods,
		formatGoalAmount,
		getGoalPriorityLabel,
		getGoalStatusLabel,
		getGoalTypeLabel,
		goalProgressPercentage,
		remainingGoalAmount
	} from '../../utils/financial-goal-labels';
	import { projectGoalCompletion } from '../../utils/goal-projection';
	import { sumActiveGoalDistribution } from '../../utils/goal-distribution';
	import type { FinancialGoalListProps } from './props';

	let { goals, planningPeriods, onCreate, onEdit, onDelete }: FinancialGoalListProps = $props();
	let distributionPercentage = $derived(sumActiveGoalDistribution(goals));
</script>

<section class="overflow-hidden rounded-lg border border-outline bg-surface shadow-sm">
	<div class="flex flex-col gap-4 border-b border-outline px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-lg font-bold text-on-surface">Metas financieras</h2>
			<p class="mt-1 text-sm text-on-surface-muted">Define hacia dónde dirigir el dinero libre disponible.</p>
		</div>
		<ActionButton type="button" onclick={onCreate}>
			<PlusIcon />
			Nueva meta
		</ActionButton>
	</div>

	<div class="grid gap-3 border-b border-outline bg-primary/10 px-5 py-4 sm:grid-cols-2">
		<div>
			<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Dinero libre distribuido</p>
			<p class="mt-1 text-2xl font-bold text-primary">{distributionPercentage}%</p>
		</div>
		<div>
			<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Sin distribuir</p>
			<p class="mt-1 text-2xl font-bold text-on-surface">{Math.max(0, 100 - distributionPercentage)}%</p>
		</div>
	</div>

	{#if goals.length === 0}
		<div class="px-6 py-12 text-center">
			<TargetIcon class="mx-auto size-9 text-primary" />
			<p class="mt-3 font-bold text-on-surface-variant">Aún no hay metas</p>
			<p class="mt-1 text-sm text-on-surface-muted">Registra algo que quieras comprar, crear o ahorrar.</p>
		</div>
	{:else}
		<ul class="grid gap-3 p-4">
			{#each goals as goal (goal.id)}
				{@const projection = projectGoalCompletion(goal, planningPeriods)}
				<li class="rounded-lg border border-outline bg-background p-4">
					<div class="flex flex-col gap-3 lg:flex-row lg:items-start">
						<div class="min-w-0 flex-1">
							<div class="flex flex-wrap items-center gap-2">
								<p class="font-bold text-on-surface">{goal.name}</p>
								<span class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{getGoalTypeLabel(goal.type)}</span>
								<span class="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-bold text-on-surface-muted">{getGoalStatusLabel(goal.status)}</span>
							</div>
							<p class="mt-1 text-sm text-on-surface-muted">
								{getGoalPriorityLabel(goal.priority)} prioridad
							</p>
						</div>
						<div class="flex items-center gap-1">
							<ActionButton type="button" variant="ghost" size="icon-sm" onclick={() => onEdit(goal)} aria-label={`Editar meta ${goal.name}`} title="Editar meta"><PencilIcon /></ActionButton>
							<ActionButton type="button" intent="danger" size="icon-sm" onclick={() => onDelete(goal)} aria-label={`Eliminar meta ${goal.name}`} title="Eliminar meta"><Trash2Icon /></ActionButton>
						</div>
					</div>

					<div class="mt-4 grid gap-3 sm:grid-cols-4">
						<div>
							<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Objetivo</p>
							<p class="mt-1 font-bold text-on-surface">{formatGoalAmount(goal.targetAmountCents, goal.currencyCode)}</p>
						</div>
						<div>
							<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Acumulado</p>
							<p class="mt-1 font-bold text-primary">{formatGoalAmount(goal.currentAmountCents, goal.currencyCode)}</p>
						</div>
						<div>
							<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Restante</p>
							<p class="mt-1 font-bold text-on-surface">{formatGoalAmount(remainingGoalAmount(goal), goal.currencyCode)}</p>
						</div>
						<div>
							<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Distribución</p>
							<p class="mt-1 font-bold text-on-surface">{goal.distributionPercentage}%</p>
						</div>
						<div>
							<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Aportación próxima</p>
							<p class="mt-1 font-bold text-on-surface">{formatGoalAmount(projection.estimatedNextContributionCents, goal.currencyCode)}</p>
						</div>
						<div>
							<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Tiempo estimado</p>
							<p class="mt-1 font-bold text-on-surface">{formatEstimatedPeriods(projection.estimatedRemainingPeriods)}</p>
						</div>
						<div class="sm:col-span-2">
							<p class="text-xs font-bold tracking-wide text-on-surface-muted uppercase">Finalización estimada</p>
							<p class="mt-1 font-bold text-on-surface">{formatEstimatedCompletionDate(projection.estimatedCompletionDate)}</p>
							{#if projection.unavailableReason}<p class="mt-1 text-xs text-on-surface-muted">{projection.unavailableReason}</p>{/if}
						</div>
					</div>

					<div class="mt-4">
						<div class="mb-1 flex items-center justify-between text-xs font-semibold text-on-surface-muted">
							<span>Progreso</span>
							<span>{goalProgressPercentage(goal)}%</span>
						</div>
						<div class="h-2 overflow-hidden rounded-full bg-surface-muted">
							<div class="h-full rounded-full bg-primary" style={`width: ${goalProgressPercentage(goal)}%`}></div>
						</div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>
