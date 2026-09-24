<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { DeleteLoanFormProps } from './props';

	let { loan, feedback = null, onCancel }: DeleteLoanFormProps = $props();
	let deleteFeedback = $derived(feedback?.action === 'delete-loan' && feedback.targetId === loan.id ? feedback : null);
</script>

<form method="POST" action="?/deleteLoan" class="grid gap-4">
	<input type="hidden" name="id" value={loan.id} />
	<p class="break-words text-on-surface-variant">Se revertirán los movimientos activos vinculados al préstamo y después se eliminará el registro.</p>
	{#if deleteFeedback?.message}<p class="break-words rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{deleteFeedback.message}</p>{/if}
	<div class="grid gap-2 sm:flex sm:justify-end">
		<ActionButton type="button" intent="secondary" class="w-full sm:w-auto" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger" class="w-full sm:w-auto">Eliminar préstamo</ActionButton>
	</div>
</form>
