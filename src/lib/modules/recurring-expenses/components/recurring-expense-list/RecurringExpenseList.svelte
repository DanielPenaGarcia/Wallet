<script lang="ts">
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ReceiptTextIcon from '@lucide/svelte/icons/receipt-text';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { ActionButton } from '$lib/components/ui/action-button';
	import { getAccountTypeLabel } from '$lib/modules/accounts/utils/account-labels';
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
	<div class="flex flex-col gap-3 border-b border-outline px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between">
		<div class="min-w-0">
			<h2 class="text-lg font-bold text-on-surface">Gastos recurrentes</h2>
			<p class="mt-1 break-words text-sm text-on-surface-muted">Obligaciones periódicas configuradas para seguimiento.</p>
		</div>
		<ActionButton type="button" class="w-full md:w-auto" onclick={onCreate}><PlusIcon />Registrar</ActionButton>
	</div>
	{#if expenses.length === 0}
		<div class="px-6 py-12 text-center">
			<ReceiptTextIcon class="mx-auto size-9 text-primary" />
			<p class="mt-3 font-bold text-on-surface-variant">Sin gastos recurrentes</p>
			<p class="mt-1 text-sm text-on-surface-muted">Registra servicios, suscripciones u obligaciones frecuentes.</p>
		</div>
	{:else}
		<div class="grid gap-3 p-4 lg:hidden">
			{#each expenses as expense (expense.id)}
				<article class="rounded-md bg-surface-subtle p-4">
					<div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
						<div class="min-w-0">
							<p class="break-words font-bold text-on-surface">{expense.name}</p>
							<div class="mt-2 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
								{#if expense.category?.color}<span class="size-3 rounded-full" style={`background-color: ${expense.category.color}`}></span>{/if}
								<span class="break-words">{expense.category?.name ?? 'Sin categoría'}</span>
								{#if expense.category?.isEssential}
									<span class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">Esencial</span>
								{/if}
							</div>
						</div>
						<span class="w-fit rounded-full px-2.5 py-1 text-xs font-bold {expense.isActive ? 'bg-secondary text-on-secondary' : 'bg-surface-muted text-on-surface-muted'}">
							{expense.isActive ? 'Activo' : 'Inactivo'}
						</span>
					</div>
					<div class="mt-4 grid gap-3 sm:grid-cols-2">
						<div>
							<p class="text-xs font-bold text-on-surface-muted">Cuenta</p>
							{#if expense.paymentAccount}
								<p class="mt-1 break-words font-semibold text-on-surface">{expense.paymentAccount.name}</p>
								<p class="text-xs text-on-surface-muted">
									{getAccountTypeLabel(expense.paymentAccount.type)}
									{#if expense.paymentAccount.cardLastFourDigits}
										· •••• {expense.paymentAccount.cardLastFourDigits}
									{/if}
								</p>
							{:else}
								<span class="mt-1 inline-flex rounded-full bg-surface-muted px-2.5 py-1 text-xs font-bold text-on-surface-muted">Sin asignar</span>
							{/if}
						</div>
						<div>
							<p class="text-xs font-bold text-on-surface-muted">Monto</p>
							<p class="mt-1 break-words font-semibold text-on-surface">{formatRecurringExpenseAmount(expense.amountCents)}</p>
							<p class="text-xs text-on-surface-muted">{getRecurringExpenseAmountKindLabel(expense.amountKind)}</p>
						</div>
						<div>
							<p class="text-xs font-bold text-on-surface-muted">Frecuencia</p>
							<p class="mt-1 break-words text-sm text-on-surface-variant">{getRecurringExpenseFrequencyLabel(expense)}</p>
							<p class="break-words text-xs text-on-surface-muted">{formatPaymentSchedule(expense.paymentSchedule)}</p>
						</div>
						<div>
							<p class="text-xs font-bold text-on-surface-muted">Próximo</p>
							<p class="mt-1 font-semibold text-on-surface">{formatIsoDate(expense.nextOccurrenceAt)}</p>
							<p class="text-xs text-on-surface-muted">Último pago: {formatIsoDate(expense.lastPaidAt)}</p>
						</div>
					</div>
					{#if expense.statementDay}
						<p class="mt-3 text-xs text-on-surface-muted">Corte: día {expense.statementDay}</p>
					{/if}
					<div class="mt-4 grid grid-cols-2 gap-2">
						<ActionButton type="button" variant="ghost" class="w-full" onclick={() => onEdit(expense)} aria-label={`Editar gasto ${expense.name}`} title="Editar gasto"><PencilIcon /></ActionButton>
						<ActionButton type="button" intent="danger" class="w-full" onclick={() => onDelete(expense)} aria-label={`Eliminar gasto ${expense.name}`} title="Eliminar gasto"><Trash2Icon /></ActionButton>
					</div>
				</article>
			{/each}
		</div>
		<div class="hidden overflow-x-auto lg:block">
			<table class="w-full min-w-[1240px] text-left text-sm">
				<thead class="bg-surface-subtle text-xs font-bold tracking-wide text-on-surface-muted uppercase">
					<tr>
						<th class="px-5 py-3">Gasto</th>
						<th class="px-5 py-3">Categoría</th>
						<th class="px-5 py-3">Cuenta</th>
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
							<td class="px-5 py-4 text-on-surface-variant">
								{#if expense.paymentAccount}
									<div class="grid gap-1">
										<span class="font-semibold text-on-surface">{expense.paymentAccount.name}</span>
										<span class="text-xs text-on-surface-muted">
											{getAccountTypeLabel(expense.paymentAccount.type)}
											{#if expense.paymentAccount.cardLastFourDigits}
												· •••• {expense.paymentAccount.cardLastFourDigits}
											{/if}
										</span>
									</div>
								{:else}
									<span class="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-bold text-on-surface-muted">Sin asignar</span>
								{/if}
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
