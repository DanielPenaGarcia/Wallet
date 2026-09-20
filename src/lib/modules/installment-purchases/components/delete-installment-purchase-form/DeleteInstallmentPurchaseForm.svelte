<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { DeleteInstallmentPurchaseFormProps } from './props';

	let { purchase, feedback = null, onCancel }: DeleteInstallmentPurchaseFormProps = $props();
	let deleteFeedback = $derived(
		feedback?.action === 'delete-installment-purchase' && feedback.targetId === purchase.id
			? feedback
			: null
	);
</script>

<form method="POST" action="?/deleteInstallmentPurchase" class="grid gap-4">
	<input type="hidden" name="id" value={purchase.id} />
	<p class="text-on-surface-variant">
		Se eliminará la compra MSI "{purchase.description}". Esta acción no modifica el saldo consumido de la tarjeta.
	</p>
	{#if deleteFeedback?.message}
		<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{deleteFeedback.message}</p>
	{/if}
	<div class="flex justify-end gap-2">
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger">Eliminar compra</ActionButton>
	</div>
</form>
