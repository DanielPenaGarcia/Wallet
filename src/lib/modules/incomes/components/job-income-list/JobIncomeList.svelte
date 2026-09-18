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

<section class="overflow-hidden rounded-lg border border-outline bg-surface shadow-sm">
	<div class="flex flex-col gap-4 border-b border-outline px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-lg font-bold text-on-surface">Trabajos registrados</h2>
			<p class="mt-1 text-sm text-on-surface-muted">Ingresos recurrentes expresados como ganancia mensual.</p>
		</div>
		<ActionButton type="button" onclick={onCreate}>
			<PlusIcon />
			Nuevo ingreso
		</ActionButton>
	</div>
	{#if incomes.length === 0}
		<div class="px-6 py-12 text-center">
			<p class="font-bold text-on-surface-variant">Aún no hay ingresos de trabajo</p>
			<p class="mt-1 text-sm text-on-surface-muted">Registra tu primer trabajo para comenzar.</p>
		</div>
	{:else}
		<ul class="divide-y divide-outline">
			{#each incomes as income (income.id)}
				<li class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
					<div class="min-w-0 flex-1">
						<p class="font-bold text-on-surface">{income.jobName}</p>
						<p class="mt-1 text-sm text-on-surface-muted">{getIncomePaymentCadenceLabel(income.paymentFrequency)}</p>
						{#if income.schedule}
							<p class="mt-1 text-xs font-semibold text-on-surface-muted">Horario: {income.schedule}</p>
						{/if}
					</div>
					<div class="sm:text-right">
						<p class="text-lg font-bold text-secondary">{formatCurrencyFromMinorUnits(income.monthlyAmount, income.currencyCode)}</p>
						<p class="text-xs font-semibold tracking-wide text-on-surface-muted uppercase">Mensual · {income.amountType === 'gross' ? 'Bruto' : 'Neto'}</p>
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
