<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { DeleteFinancialGoalFormProps } from './props';

	let { goal, feedback = null, onCancel }: DeleteFinancialGoalFormProps = $props();
	let deleteFeedback = $derived(
		feedback?.action === 'delete-goal' && feedback.targetId === goal.id ? feedback : null
	);
</script>

<form method="POST" action="?/deleteFinancialGoal" class="grid gap-4">
	<input type="hidden" name="id" value={goal.id} />
	<p class="text-slate-600">El objetivo dejará de estar activo y su porcentaje volverá a estar disponible.</p>
	{#if deleteFeedback?.message}
		<p class="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{deleteFeedback.message}</p>
	{/if}
	<div class="flex justify-end gap-2">
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger">Eliminar objetivo</ActionButton>
	</div>
</form>
