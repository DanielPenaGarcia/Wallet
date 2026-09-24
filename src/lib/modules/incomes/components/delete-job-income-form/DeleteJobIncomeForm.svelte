<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { DeleteJobIncomeFormProps } from './props';

	let { income, feedback = null, onCancel }: DeleteJobIncomeFormProps = $props();
	let deleteFeedback = $derived(feedback?.action === 'delete-income' && feedback.targetId === income.id ? feedback : null);
</script>

<form method="POST" action="?/deleteJobIncome" class="grid gap-4">
	<input type="hidden" name="id" value={income.id} />
	<p class="text-on-surface-variant">El ingreso dejará de estar disponible, pero conservará su registro para mantener el historial financiero.</p>
	{#if deleteFeedback?.message}<p class="break-words rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{deleteFeedback.message}</p>{/if}
	<div class="grid gap-2 sm:flex sm:justify-end">
		<ActionButton type="button" intent="secondary" class="w-full sm:w-auto" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger" class="w-full sm:w-auto">Eliminar ingreso</ActionButton>
	</div>
</form>
