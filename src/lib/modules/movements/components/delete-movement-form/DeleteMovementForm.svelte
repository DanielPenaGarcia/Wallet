<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { DeleteMovementFormProps } from './props';

	let { movement, feedback = null, onCancel }: DeleteMovementFormProps = $props();
	let deleteFeedback = $derived(
		feedback?.action === 'delete-movement' && feedback.targetId === movement.id ? feedback : null
	);
</script>

<form method="POST" action="?/deleteMovement" class="grid gap-4">
	<input type="hidden" name="id" value={movement.id} />
	<p class="text-slate-600">El movimiento dejará de aparecer en la lista, pero su registro se conservará.</p>
	{#if deleteFeedback?.message}<p class="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{deleteFeedback.message}</p>{/if}
	<div class="flex justify-end gap-2">
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger">Eliminar movimiento</ActionButton>
	</div>
</form>
