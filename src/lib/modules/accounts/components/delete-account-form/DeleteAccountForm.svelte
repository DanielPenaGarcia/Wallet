<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import { getAccountDisplayName } from '../../utils/account-labels';
	import type { DeleteAccountFormProps } from './props';

	let { account, feedback = null, onCancel }: DeleteAccountFormProps = $props();
	let deleteFeedback = $derived(feedback?.action === 'delete-account' && feedback.targetId === account.id ? feedback : null);
</script>

<form method="POST" action="?/deleteAccount" class="grid gap-4">
	<input type="hidden" name="id" value={account.id} />
	<p class="text-on-surface-variant">La cuenta {getAccountDisplayName(account)} se eliminará de la configuración.</p>
	{#if deleteFeedback?.message}<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{deleteFeedback.message}</p>{/if}
	<div class="flex justify-end gap-2">
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger">Eliminar cuenta</ActionButton>
	</div>
</form>
