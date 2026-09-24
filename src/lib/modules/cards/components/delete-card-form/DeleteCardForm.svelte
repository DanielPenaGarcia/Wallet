<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { DeleteCardFormProps } from './props';

	let { card, feedback = null, onCancel }: DeleteCardFormProps = $props();
	let deleteFeedback = $derived(feedback?.action === 'delete-card' && feedback.targetId === card.id ? feedback : null);
</script>

<form method="POST" action="?/deleteCard" class="grid gap-4">
	<input type="hidden" name="id" value={card.id} />
	<p class="break-words text-on-surface-variant">La cuenta dejará de aparecer en tus listas activas y no podrá seleccionarse en nuevos movimientos.</p>
	<p class="break-words rounded-md border border-tertiary/20 bg-tertiary/10 px-3 py-2 text-sm text-tertiary">Los movimientos históricos relacionados se conservarán.</p>
	{#if deleteFeedback?.message}<p class="break-words rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{deleteFeedback.message}</p>{/if}
	<div class="grid gap-2 sm:flex sm:justify-end">
		<ActionButton type="button" intent="secondary" class="w-full sm:w-auto" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger" class="w-full sm:w-auto">Eliminar cuenta</ActionButton>
	</div>
</form>
