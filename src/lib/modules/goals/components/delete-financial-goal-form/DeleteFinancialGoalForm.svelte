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
	<p class="break-words text-on-surface-variant">La meta se eliminará de la configuración.</p>
	{#if deleteFeedback?.message}
		<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{deleteFeedback.message}</p>
	{/if}
	<div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
		<ActionButton type="button" intent="secondary" class="w-full sm:w-auto" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger" class="w-full sm:w-auto">Eliminar meta</ActionButton>
	</div>
</form>
