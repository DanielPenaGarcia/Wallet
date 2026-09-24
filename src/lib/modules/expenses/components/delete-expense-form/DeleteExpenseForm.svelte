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
	<p class="text-on-surface-variant">
		El gasto dejará de aparecer en la lista, pero su registro y la bitácora de montos se conservarán.
	</p>
	{#if deleteFeedback?.message}
		<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
			{deleteFeedback.message}
		</p>
	{/if}
	<div class="grid gap-2 sm:flex sm:justify-end">
		<ActionButton type="button" intent="secondary" class="w-full sm:w-auto" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger" class="w-full sm:w-auto">Eliminar gasto</ActionButton>
	</div>
</form>
