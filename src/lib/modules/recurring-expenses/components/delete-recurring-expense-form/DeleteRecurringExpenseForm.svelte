<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { DeleteRecurringExpenseFormProps } from './props';

	let { expense, feedback = null, onCancel }: DeleteRecurringExpenseFormProps = $props();
	let deleteFeedback = $derived(feedback?.action === 'delete-recurring-expense' ? feedback : null);
</script>

<form method="POST" action="?/deleteRecurringExpense" class="grid gap-4">
	<input type="hidden" name="id" value={expense.id} />
	<p class="text-on-surface-variant">El gasto recurrente se eliminará de la configuración.</p>
	{#if deleteFeedback?.message}<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{deleteFeedback.message}</p>{/if}
	<div class="flex justify-end gap-2">
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger">Eliminar gasto</ActionButton>
	</div>
</form>
