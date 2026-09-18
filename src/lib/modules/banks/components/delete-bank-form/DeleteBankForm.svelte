<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { DeleteBankFormProps } from './props';

	let { bank, feedback = null, onCancel }: DeleteBankFormProps = $props();
	let matchingFeedback = $derived(feedback?.action === 'delete-bank' && feedback.targetId === bank.id ? feedback : null);
</script>

<form method="POST" action="?/deleteBank" class="grid gap-4">
	<input type="hidden" name="id" value={bank.id} />
	<p class="text-sm text-on-surface-variant">Se eliminará <span class="font-bold text-on-surface">{bank.name}</span> del catálogo de bancos.</p>
	{#if matchingFeedback?.message}<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{matchingFeedback.message}</p>{/if}
	<div class="flex justify-end gap-2">
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger">Eliminar</ActionButton>
	</div>
</form>
