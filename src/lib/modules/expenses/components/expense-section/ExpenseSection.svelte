<script lang="ts">
	import { untrack } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import CreateExpenseForm from '../create-expense-form/CreateExpenseForm.svelte';
	import ExpenseList from '../expense-list/ExpenseList.svelte';
	import type { ExpenseSectionProps } from './props';

	let { expenses, categories, cards, feedback = null }: ExpenseSectionProps = $props();
	let createOpen = $state(untrack(() => feedback?.action === 'create-expense' && Boolean(feedback.errors || feedback.message)));
</script>

{#if feedback?.success}
	<p class="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{feedback.success}</p>
{/if}

<ExpenseList {expenses} {categories} {cards} {feedback} onCreate={() => (createOpen = true)} />

<Dialog.Root bind:open={createOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Nuevo gasto</Dialog.Title>
			<Dialog.Description>Registra el importe y cómo debe organizarse.</Dialog.Description>
		</Dialog.Header>
		{#if categories.length === 0}
			<p class="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Primero registra una categoría activa desde Configuración.</p>
		{/if}
		<CreateExpenseForm {categories} {feedback} />
	</Dialog.Content>
</Dialog.Root>
