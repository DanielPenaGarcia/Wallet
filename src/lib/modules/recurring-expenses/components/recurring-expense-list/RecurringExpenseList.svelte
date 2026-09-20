<script lang="ts">
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ReceiptTextIcon from '@lucide/svelte/icons/receipt-text';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { ActionButton } from '$lib/components/ui/action-button';
	import {
		formatIsoDate,
		formatPaymentSchedule,
		formatRecurringExpenseAmount,
		getRecurringExpenseAmountKindLabel,
		getRecurringExpenseFrequencyLabel
	} from '../../utils/recurring-expense-labels';
	import type { RecurringExpenseListProps } from './props';

	let { expenses, onCreate, onEdit, onDelete }: RecurringExpenseListProps = $props();
</script>

<section class="overflow-hidden rounded-lg border border-outline bg-surface shadow-sm">
	<div class="flex items-center justify-between gap-4 border-b border-outline px-5 py-4">
		<div>
			<h2 class="text-lg font-bold text-on-surface">Gastos recurrentes</h2>
			<p class="mt-1 text-sm text-on-surface-muted">Obligaciones periódicas configuradas para seguimiento.</p>
		</div>
		<ActionButton type="button" onclick={onCreate}><PlusIcon />Registrar</ActionButton>
	</div>
	{#if expenses.length === 0}
		<div class="px-6 py-12 text-center">
			<ReceiptTextIcon class="mx-auto size-9 text-primary" />
			<p class="mt-3 font-bold text-on-surface-variant">Sin gastos recurrentes</p>
			<p class="mt-1 text-sm text-on-surface-muted">Registra servicios, suscripciones u obligaciones frecuentes.</p>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full min-w-[1120px] text-left text-sm">
				<thead class="bg-surface-subtle text-xs font-bold tracking-wide text-on-surface-muted uppercase">
					<tr>
						<th class="px-5 py-3">Gasto</th>
						<th class="px-5 py-3">Categoría</th>
						<th class="px-5 py-3">Monto</th>
						<th class="px-5 py-3">Frecuencia</th>
						<th class="px-5 py-3">Pago</th>
						<th class="px-5 py-3">Corte</th>
						<th class="px-5 py-3">Último pago</th>
						<th class="px-5 py-3">Próximo</th>
						<th class="px-5 py-3">Estado</th>
						<th class="px-5 py-3 text-right">Acciones</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-outline">
					{#each expenses as expense (expense.id)}
						<tr>
							<td class="px-5 py-4">
								<span class="font-bold text-on-surface">{expense.name}</span>
							</td>
							<td class="px-5 py-4 text-on-surface-variant">
								<div class="flex items-center gap-2">
									{#if expense.category?.color}<span class="size-3 rounded-full" style={`background-color: ${expense.category.color}`}></span>{/if}
									<span>{expense.category?.name ?? 'Sin categoría'}</span>
									{#if expense.category?.isEssential}
										<span class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">Esencial</span>
									{/if}
								</div>
							</td>
							<td class="px-5 py-4">
								<div class="grid">
									<span class="font-semibold text-on-surface">{formatRecurringExpenseAmount(expense.amountCents)}</span>
									<span class="text-xs text-on-surface-muted">{getRecurringExpenseAmountKindLabel(expense.amountKind)}</span>
								</div>
							</td>
							<td class="px-5 py-4 text-on-surface-variant">{getRecurringExpenseFrequencyLabel(expense)}</td>
							<td class="px-5 py-4 text-on-surface-variant">{formatPaymentSchedule(expense.paymentSchedule)}</td>
							<td class="px-5 py-4 text-on-surface-variant">{expense.statementDay ? `Día ${expense.statementDay}` : 'Sin corte'}</td>
							<td class="px-5 py-4 text-on-surface-variant">{formatIsoDate(expense.lastPaidAt)}</td>
							<td class="px-5 py-4 font-semibold text-on-surface">{formatIsoDate(expense.nextOccurrenceAt)}</td>
							<td class="px-5 py-4">
								<span class="rounded-full px-2.5 py-1 text-xs font-bold {expense.isActive ? 'bg-secondary text-on-secondary' : 'bg-surface-muted text-on-surface-muted'}">
									{expense.isActive ? 'Activo' : 'Inactivo'}
								</span>
							</td>
							<td class="px-5 py-4">
								<div class="flex justify-end gap-1">
									<ActionButton type="button" variant="ghost" size="icon-sm" onclick={() => onEdit(expense)} aria-label={`Editar gasto ${expense.name}`} title="Editar gasto"><PencilIcon /></ActionButton>
									<ActionButton type="button" intent="danger" size="icon-sm" onclick={() => onDelete(expense)} aria-label={`Eliminar gasto ${expense.name}`} title="Eliminar gasto"><Trash2Icon /></ActionButton>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
