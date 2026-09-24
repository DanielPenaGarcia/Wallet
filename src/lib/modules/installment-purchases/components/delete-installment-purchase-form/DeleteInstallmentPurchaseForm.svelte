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
	<p class="break-words text-on-surface-variant">
		Se eliminará la compra MSI "{purchase.description}". Esta acción no modifica el saldo consumido de la tarjeta.
	</p>
	{#if deleteFeedback?.message}
		<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{deleteFeedback.message}</p>
	{/if}
	<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
		<ActionButton type="button" intent="secondary" class="w-full sm:w-auto" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger" class="w-full sm:w-auto">Eliminar compra</ActionButton>
	</div>
</form>
