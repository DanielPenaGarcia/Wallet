<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { DeleteBankFormProps } from './props';

	let { bank, feedback = null, onCancel }: DeleteBankFormProps = $props();
	let matchingFeedback = $derived(feedback?.action === 'delete-bank' && feedback.targetId === bank.id ? feedback : null);
</script>

<form method="POST" action="?/deleteBank" class="grid gap-4">
	<input type="hidden" name="id" value={bank.id} />
	<p class="break-words text-sm text-on-surface-variant">Se eliminará <span class="font-bold text-on-surface">{bank.name}</span> del catálogo de bancos solo si no tiene cuentas asociadas.</p>
	{#if matchingFeedback?.message}<p class="break-words rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{matchingFeedback.message}</p>{/if}
	<div class="grid gap-2 sm:flex sm:justify-end">
		<ActionButton type="button" intent="secondary" class="w-full sm:w-auto" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger" class="w-full sm:w-auto">Eliminar</ActionButton>
	</div>
</form>
