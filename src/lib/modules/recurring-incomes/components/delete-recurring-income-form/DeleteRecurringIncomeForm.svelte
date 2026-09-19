<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { DeleteRecurringIncomeFormProps } from './props';

	let { income, feedback = null, onCancel }: DeleteRecurringIncomeFormProps = $props();
	let deleteFeedback = $derived(feedback?.action === 'delete-recurring-income' ? feedback : null);
</script>

<form method="POST" action="?/deleteRecurringIncome" class="grid gap-4">
	<input type="hidden" name="id" value={income.id} />
	<p class="text-on-surface-variant">El ingreso recurrente se eliminará de la configuración.</p>
	{#if deleteFeedback?.message}<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{deleteFeedback.message}</p>{/if}
	<div class="flex justify-end gap-2">
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger">Eliminar ingreso</ActionButton>
	</div>
</form>
