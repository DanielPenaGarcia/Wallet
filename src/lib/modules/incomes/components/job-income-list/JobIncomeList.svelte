<script lang="ts">
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
	import { getIncomePaymentCadenceLabel } from '../../utils/income-payment-frequency-options';
	import type { JobIncomeListProps } from './props';

	let { incomes, onCreate, onEdit, onDelete }: JobIncomeListProps = $props();
</script>

<section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
	<div class="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-lg font-bold text-slate-900">Trabajos registrados</h2>
			<p class="mt-1 text-sm text-slate-500">Ingresos recurrentes expresados como ganancia mensual.</p>
		</div>
		<ActionButton type="button" onclick={onCreate}>
			<PlusIcon />
			Nuevo ingreso
		</ActionButton>
	</div>
	{#if incomes.length === 0}
		<div class="px-6 py-12 text-center">
			<p class="font-bold text-slate-700">Aún no hay ingresos de trabajo</p>
			<p class="mt-1 text-sm text-slate-500">Registra tu primer trabajo para comenzar.</p>
		</div>
	{:else}
		<ul class="divide-y divide-slate-100">
			{#each incomes as income (income.id)}
				<li class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
					<div class="min-w-0 flex-1">
						<p class="font-bold text-slate-900">{income.jobName}</p>
						<p class="mt-1 text-sm text-slate-500">{getIncomePaymentCadenceLabel(income.paymentFrequency)}</p>
						{#if income.schedule}
							<p class="mt-1 text-xs font-semibold text-slate-500">Horario: {income.schedule}</p>
						{/if}
					</div>
					<div class="sm:text-right">
						<p class="text-lg font-bold text-emerald-700">{formatCurrencyFromMinorUnits(income.monthlyAmount, income.currencyCode)}</p>
						<p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">Mensual · {income.amountType === 'gross' ? 'Bruto' : 'Neto'}</p>
					</div>
					<div class="flex items-center gap-1 sm:ml-2">
						<ActionButton type="button" variant="ghost" size="icon-sm" onclick={() => onEdit(income)} aria-label={`Editar ingreso ${income.jobName}`} title="Editar ingreso"><PencilIcon /></ActionButton>
						<ActionButton type="button" intent="danger" size="icon-sm" onclick={() => onDelete(income)} aria-label={`Eliminar ingreso ${income.jobName}`} title="Eliminar ingreso"><Trash2Icon /></ActionButton>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>
