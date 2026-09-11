<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { DeleteCardFormProps } from './props';

	let { card, feedback = null, onCancel }: DeleteCardFormProps = $props();
	let deleteFeedback = $derived(feedback?.action === 'delete-card' && feedback.targetId === card.id ? feedback : null);
</script>

<form method="POST" action="?/deleteCard" class="grid gap-4">
	<input type="hidden" name="id" value={card.id} />
	<p class="text-slate-600">La tarjeta dejará de aparecer en tus listas activas y no podrá seleccionarse en nuevos movimientos.</p>
	<p class="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">Los movimientos históricos relacionados se conservarán.</p>
	{#if deleteFeedback?.message}<p class="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{deleteFeedback.message}</p>{/if}
	<div class="flex justify-end gap-2">
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger">Eliminar tarjeta</ActionButton>
	</div>
</form>
