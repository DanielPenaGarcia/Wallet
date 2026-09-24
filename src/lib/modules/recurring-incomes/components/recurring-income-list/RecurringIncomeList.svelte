<script lang="ts">
	import BadgeDollarSignIcon from '@lucide/svelte/icons/badge-dollar-sign';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { ActionButton } from '$lib/components/ui/action-button';
	import {
		formatPaymentSchedule,
		formatRecurringIncomeAmount,
		formatWorkScheduleSummary,
		getIncomeFrequencyLabel,
		getIncomeSourceLabel
	} from '../../utils/recurring-income-labels';
	import type { RecurringIncomeListProps } from './props';

	let { incomes, onCreate, onEdit, onDelete }: RecurringIncomeListProps = $props();
</script>

<section class="overflow-hidden rounded-lg border border-outline bg-surface shadow-sm">
	<div class="flex flex-col gap-3 border-b border-outline px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between">
		<div class="min-w-0">
			<h2 class="text-lg font-bold text-on-surface">Ingresos recurrentes</h2>
			<p class="mt-1 break-words text-sm text-on-surface-muted">Fuentes de dinero esperadas por periodo.</p>
		</div>
		<ActionButton type="button" class="w-full md:w-auto" onclick={onCreate}><PlusIcon />Registrar</ActionButton>
	</div>
	{#if incomes.length === 0}
		<div class="px-6 py-12 text-center">
			<BadgeDollarSignIcon class="mx-auto size-9 text-primary" />
			<p class="mt-3 font-bold text-on-surface-variant">Sin ingresos recurrentes</p>
			<p class="mt-1 text-sm text-on-surface-muted">Los ingresos periódicos aparecerán aquí.</p>
		</div>
	{:else}
		<div class="grid gap-3 p-4 lg:hidden">
			{#each incomes as income (income.id)}
				<article class="rounded-md bg-surface-subtle p-4">
					<div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
						<div class="min-w-0">
							<p class="break-words font-bold text-on-surface">{income.title}</p>
							<p class="mt-1 text-sm text-on-surface-variant">{getIncomeSourceLabel(income.source)}</p>
						</div>
						<span class="w-fit rounded-full px-2.5 py-1 text-xs font-bold {income.isActive ? 'bg-secondary text-on-secondary' : 'bg-surface-muted text-on-surface-muted'}">
							{income.isActive ? 'Activo' : 'Inactivo'}
						</span>
					</div>
					<div class="mt-4 grid gap-3 sm:grid-cols-2">
						<div>
							<p class="text-xs font-bold text-on-surface-muted">Monto</p>
							<p class="mt-1 break-words font-semibold text-on-surface">{formatRecurringIncomeAmount(income.expectedAmountCents)}</p>
						</div>
						<div>
							<p class="text-xs font-bold text-on-surface-muted">Frecuencia</p>
							<p class="mt-1 break-words text-sm text-on-surface-variant">{getIncomeFrequencyLabel(income.frequency)}</p>
							<p class="break-words text-xs text-on-surface-muted">{formatPaymentSchedule(income.paymentSchedule)}</p>
						</div>
						<div class="sm:col-span-2">
							<p class="text-xs font-bold text-on-surface-muted">Horario</p>
							<p class="mt-1 break-words text-sm text-on-surface-variant">{formatWorkScheduleSummary(income.workSchedule)}</p>
						</div>
					</div>
					<div class="mt-4 grid grid-cols-2 gap-2">
						<ActionButton type="button" variant="ghost" class="w-full" onclick={() => onEdit(income)} aria-label={`Editar ingreso ${income.title}`} title="Editar ingreso"><PencilIcon /></ActionButton>
						<ActionButton type="button" intent="danger" class="w-full" onclick={() => onDelete(income)} aria-label={`Eliminar ingreso ${income.title}`} title="Eliminar ingreso"><Trash2Icon /></ActionButton>
					</div>
				</article>
			{/each}
		</div>
		<div class="hidden overflow-x-auto lg:block">
			<table class="w-full min-w-[980px] text-left text-sm">
				<thead class="bg-surface-subtle text-xs font-bold tracking-wide text-on-surface-muted uppercase">
					<tr>
						<th class="px-5 py-3">Ingreso</th>
						<th class="px-5 py-3">Fuente</th>
						<th class="px-5 py-3">Monto</th>
						<th class="px-5 py-3">Frecuencia</th>
						<th class="px-5 py-3">Pago</th>
						<th class="px-5 py-3">Horario</th>
						<th class="px-5 py-3">Estado</th>
						<th class="px-5 py-3 text-right">Acciones</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-outline">
					{#each incomes as income (income.id)}
						<tr>
							<td class="px-5 py-4">
								<span class="font-bold text-on-surface">{income.title}</span>
							</td>
							<td class="px-5 py-4 text-on-surface-variant">{getIncomeSourceLabel(income.source)}</td>
							<td class="px-5 py-4 font-semibold text-on-surface">{formatRecurringIncomeAmount(income.expectedAmountCents)}</td>
							<td class="px-5 py-4 text-on-surface-variant">{getIncomeFrequencyLabel(income.frequency)}</td>
							<td class="px-5 py-4 text-on-surface-variant">{formatPaymentSchedule(income.paymentSchedule)}</td>
							<td class="max-w-72 px-5 py-4 text-on-surface-variant">
								<span class="line-clamp-2">{formatWorkScheduleSummary(income.workSchedule)}</span>
							</td>
							<td class="px-5 py-4">
								<span class="rounded-full px-2.5 py-1 text-xs font-bold {income.isActive ? 'bg-secondary text-on-secondary' : 'bg-surface-muted text-on-surface-muted'}">
									{income.isActive ? 'Activo' : 'Inactivo'}
								</span>
							</td>
							<td class="px-5 py-4">
								<div class="flex justify-end gap-1">
									<ActionButton type="button" variant="ghost" size="icon-sm" onclick={() => onEdit(income)} aria-label={`Editar ingreso ${income.title}`} title="Editar ingreso"><PencilIcon /></ActionButton>
									<ActionButton type="button" intent="danger" size="icon-sm" onclick={() => onDelete(income)} aria-label={`Eliminar ingreso ${income.title}`} title="Eliminar ingreso"><Trash2Icon /></ActionButton>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
