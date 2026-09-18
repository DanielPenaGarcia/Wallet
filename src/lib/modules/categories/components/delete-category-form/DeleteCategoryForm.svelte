<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { DeleteCategoryFormProps } from './props';

	let { category, feedback = null, onCancel }: DeleteCategoryFormProps = $props();
	let deleteFeedback = $derived(feedback?.action === 'delete-category' ? feedback : null);
</script>

<form method="POST" action="?/deleteCategory" class="grid gap-4">
	<input type="hidden" name="id" value={category.id} />
	<p class="text-on-surface-variant">La categoría se eliminará del catálogo. Si tiene subcategorías, también se eliminarán.</p>
	{#if deleteFeedback?.message}<p class="rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{deleteFeedback.message}</p>{/if}
	<div class="flex justify-end gap-2">
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger">Eliminar categoría</ActionButton>
	</div>
</form>
