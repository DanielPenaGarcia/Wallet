<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { DeleteExpenseFormProps } from './props';

	let { expense, feedback = null, onCancel }: DeleteExpenseFormProps = $props();
	let deleteFeedback = $derived(
		feedback?.action === 'delete-expense' && feedback.targetId === expense.id ? feedback : null
	);
</script>

<form method="POST" action="?/deleteExpense" class="grid gap-4">
	<input type="hidden" name="id" value={expense.id} />
	<p class="text-slate-600">
		El gasto dejará de aparecer en la lista, pero su registro y la bitácora de montos se conservarán.
	</p>
	{#if deleteFeedback?.message}
		<p class="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
			{deleteFeedback.message}
		</p>
	{/if}
	<div class="flex justify-end gap-2">
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger">Eliminar gasto</ActionButton>
	</div>
</form>
