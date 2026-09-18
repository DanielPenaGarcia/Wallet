<script lang="ts">
	import { untrack } from 'svelte';
	import HistoryIcon from '@lucide/svelte/icons/history';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { ActionButton } from '$lib/components/ui/action-button';
	import * as Dialog from '$lib/components/ui/dialog';
	import DeleteExpenseForm from '../delete-expense-form/DeleteExpenseForm.svelte';
	import EditExpenseForm from '../edit-expense-form/EditExpenseForm.svelte';
	import ExpenseHistory from '../expense-history/ExpenseHistory.svelte';
	import PayExpenseForm from '../pay-expense-form/PayExpenseForm.svelte';
	import { formatExpenseAmount } from '../../utils/format-expense-amount';
	import {
		expenseClassificationOptions,
		getExpenseFrequencyLabel
	} from '../../utils/expense-form-options';
	import type { ExpenseListProps } from './props';

	let { expenses, categories, cards, feedback = null, onCreate }: ExpenseListProps = $props();
	let payingExpense = $state(untrack(() => feedback?.action === 'pay-expense' ? expenses.find((expense) => expense.id === feedback.targetId) ?? null : null));
	let editingExpense = $state(untrack(() => feedback?.action === 'update-expense' ? expenses.find((expense) => expense.id === feedback.targetId) ?? null : null));
	let deletingExpense = $state(untrack(() => feedback?.action === 'delete-expense' ? expenses.find((expense) => expense.id === feedback.targetId) ?? null : null));
	let historyExpense = $state<typeof editingExpense>(null);

</script>

<section class="overflow-hidden rounded-lg border border-outline bg-surface shadow-sm">
	<div class="flex flex-col gap-4 border-b border-outline px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-lg font-bold text-on-surface">Gastos registrados</h2>
			<p class="mt-1 text-sm text-on-surface-muted">Importes organizados por clasificación, frecuencia y categoría.</p>
		</div>
		<ActionButton type="button" onclick={onCreate}>
			<PlusIcon />
			Nuevo gasto
		</ActionButton>
	</div>
	{#if expenses.length === 0}
		<div class="px-6 py-12 text-center">
			<p class="font-bold text-on-surface-variant">Aún no hay gastos</p>
			<p class="mt-1 text-sm text-on-surface-muted">Registra el primero para comenzar a organizar tus egresos.</p>
		</div>
	{:else}
		<ul class="divide-y divide-outline">
			{#each expenses as expense (expense.id)}
				<li class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
					<span class="size-3 shrink-0 rounded-full ring-2 ring-surface shadow-sm" style:background-color={expense.categoryColor}></span>
					<div class="min-w-0 flex-1">
						<p class="font-bold text-on-surface">{expense.name}</p>
						<p class="mt-1 text-sm text-on-surface-muted">{expense.categoryName} · {expenseClassificationOptions.find((option) => option.value === expense.classification)?.label}</p>
						{#if expense.statementDay || expense.paymentDueDay}
							<p class="mt-1 text-xs text-on-surface-muted">
								{#if expense.statementDay}Corte: día {expense.statementDay}{/if}
								{#if expense.statementDay && expense.paymentDueDay}<span class="mx-1">·</span>{/if}
								{#if expense.paymentDueDay}Pago límite: día {expense.paymentDueDay}{/if}
							</p>
						{/if}
					</div>
					<div class="sm:text-right">
						<p class="text-lg font-bold text-destructive">{formatExpenseAmount(expense.amount, expense.currencyCode, expense.amountKind)}</p>
						<p class="text-xs font-semibold tracking-wide text-on-surface-muted uppercase">{getExpenseFrequencyLabel(expense.frequency, expense.customIntervalCount, expense.customIntervalUnit)}</p>
					</div>
					<div class="flex gap-1 sm:ml-2">
						<ActionButton type="button" size="icon-sm" aria-label={`Pagar ${expense.name}`} title="Pagar gasto" onclick={() => (payingExpense = expense)}><CreditCardIcon /></ActionButton>
						<ActionButton type="button" variant="ghost" size="icon-sm" aria-label={`Ver historial de ${expense.name}`} title="Ver historial" onclick={() => (historyExpense = expense)}><HistoryIcon /></ActionButton>
						<ActionButton type="button" variant="ghost" size="icon-sm" aria-label={`Editar ${expense.name}`} title="Editar gasto" onclick={() => (editingExpense = expense)}><PencilIcon /></ActionButton>
						<ActionButton type="button" intent="danger" size="icon-sm" aria-label={`Eliminar ${expense.name}`} title="Eliminar gasto" onclick={() => (deletingExpense = expense)}><Trash2Icon /></ActionButton>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<Dialog.Root open={editingExpense !== null} onOpenChange={(open) => { if (!open) editingExpense = null; }}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Editar gasto</Dialog.Title>
			<Dialog.Description>Actualiza sus datos. Si cambia el monto, se registrará en la bitácora.</Dialog.Description>
		</Dialog.Header>
		{#if editingExpense}<EditExpenseForm expense={editingExpense} {categories} {feedback} onCancel={() => (editingExpense = null)} />{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={payingExpense !== null} onOpenChange={(open) => { if (!open) payingExpense = null; }}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Pagar {payingExpense?.name ?? 'gasto'}</Dialog.Title>
			<Dialog.Description>Registra el pago en el historial del gasto.</Dialog.Description>
		</Dialog.Header>
		{#if payingExpense}<PayExpenseForm expense={payingExpense} {cards} {feedback} onCancel={() => (payingExpense = null)} />{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={deletingExpense !== null} onOpenChange={(open) => { if (!open) deletingExpense = null; }}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Eliminar {deletingExpense?.name ?? 'gasto'}</Dialog.Title>
			<Dialog.Description>Confirma que deseas retirar este gasto de la lista activa.</Dialog.Description>
		</Dialog.Header>
		{#if deletingExpense}<DeleteExpenseForm expense={deletingExpense} {feedback} onCancel={() => (deletingExpense = null)} />{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={historyExpense !== null} onOpenChange={(open) => { if (!open) historyExpense = null; }}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Historial de {historyExpense?.name}</Dialog.Title>
			<Dialog.Description>Pagos y variaciones registradas en este gasto.</Dialog.Description>
		</Dialog.Header>
		{#if historyExpense}<ExpenseHistory expense={historyExpense} />{/if}
	</Dialog.Content>
</Dialog.Root>
