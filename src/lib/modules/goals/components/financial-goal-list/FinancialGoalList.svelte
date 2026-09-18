<script lang="ts">
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TargetIcon from '@lucide/svelte/icons/target';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
	import type { FinancialGoalListProps } from './props';

	let { goals, onCreate, onEdit, onDelete }: FinancialGoalListProps = $props();
	let allocatedPercentage = $derived(
		goals.reduce((total, goal) => total + goal.allocationPercentage, 0)
	);
</script>

<section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
	<div class="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-lg font-bold text-slate-900">Objetivos financieros</h2>
			<p class="mt-1 text-sm text-slate-500">Asigna una parte de tus ingresos a las cosas que quieres conseguir.</p>
		</div>
		<ActionButton type="button" onclick={onCreate}>
			<PlusIcon />
			Nuevo objetivo
		</ActionButton>
	</div>

	<div class="grid gap-3 border-b border-slate-200 bg-blue-50/60 px-5 py-4 sm:grid-cols-2">
		<div>
			<p class="text-xs font-bold tracking-wide text-slate-500 uppercase">Ingresos asignados</p>
			<p class="mt-1 text-2xl font-bold text-blue-800">{allocatedPercentage}%</p>
		</div>
		<div>
			<p class="text-xs font-bold tracking-wide text-slate-500 uppercase">Disponible</p>
			<p class="mt-1 text-2xl font-bold text-slate-800">{100 - allocatedPercentage}%</p>
		</div>
	</div>

	{#if goals.length === 0}
		<div class="px-6 py-12 text-center">
			<TargetIcon class="mx-auto size-9 text-blue-700" />
			<p class="mt-3 font-bold text-slate-700">Aún no hay objetivos</p>
			<p class="mt-1 text-sm text-slate-500">Registra algo que quieras comprar o conseguir.</p>
		</div>
	{:else}
		<ul class="divide-y divide-slate-100">
			{#each goals as goal (goal.id)}
				<li class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
					<div class="min-w-0 flex-1">
						<p class="font-bold text-slate-900">{goal.name}</p>
						<p class="mt-1 text-sm text-slate-500">Meta de {formatCurrencyFromMinorUnits(goal.targetAmount, goal.currencyCode)}</p>
					</div>
					<div class="sm:text-right">
						<p class="text-lg font-bold text-blue-800">{goal.allocationPercentage}%</p>
						<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">De cada ingreso</p>
					</div>
					<div class="flex items-center gap-1 sm:ml-2">
						<ActionButton type="button" variant="ghost" size="icon-sm" onclick={() => onEdit(goal)} aria-label={`Editar objetivo ${goal.name}`} title="Editar objetivo"><PencilIcon /></ActionButton>
						<ActionButton type="button" intent="danger" size="icon-sm" onclick={() => onDelete(goal)} aria-label={`Eliminar objetivo ${goal.name}`} title="Eliminar objetivo"><Trash2Icon /></ActionButton>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>
