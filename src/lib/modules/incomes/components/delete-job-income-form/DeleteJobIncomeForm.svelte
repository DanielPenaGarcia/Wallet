<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { DeleteJobIncomeFormProps } from './props';

	let { income, feedback = null, onCancel }: DeleteJobIncomeFormProps = $props();
	let deleteFeedback = $derived(feedback?.action === 'delete-income' && feedback.targetId === income.id ? feedback : null);
</script>

<form method="POST" action="?/deleteJobIncome" class="grid gap-4">
	<input type="hidden" name="id" value={income.id} />
	<p class="text-slate-600">El ingreso dejará de estar disponible, pero conservará su registro para mantener el historial financiero.</p>
	{#if deleteFeedback?.message}<p class="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{deleteFeedback.message}</p>{/if}
	<div class="flex justify-end gap-2">
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger">Eliminar ingreso</ActionButton>
	</div>
</form>
