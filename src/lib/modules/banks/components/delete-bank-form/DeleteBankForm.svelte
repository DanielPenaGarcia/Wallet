<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { DeleteBankFormProps } from './props';

	let { bank, feedback = null, onCancel }: DeleteBankFormProps = $props();
	let deleteFeedback = $derived(
		feedback?.action === 'delete-bank' && feedback.targetId === bank.id ? feedback : null
	);
</script>

<form method="POST" action="?/deleteBank" class="grid gap-4">
	<input type="hidden" name="id" value={bank.id} />
	<p class="text-slate-600">El banco dejará de estar disponible para nuevas cuentas.</p>
	<p class="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">No podrá eliminarse si tiene alguna cuenta relacionada.</p>
	{#if deleteFeedback?.message}<p class="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{deleteFeedback.message}</p>{/if}
	<div class="flex justify-end gap-2">
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger">Eliminar banco</ActionButton>
	</div>
</form>
