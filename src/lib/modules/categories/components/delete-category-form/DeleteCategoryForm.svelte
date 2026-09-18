<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { DeleteCategoryFormProps } from './props';

	let { category, feedback = null, onCancel }: DeleteCategoryFormProps = $props();
	let deleteFeedback = $derived(feedback?.action === 'delete-category' ? feedback : null);
</script>

<form method="POST" action="?/deleteCategory" class="grid gap-4">
	<input type="hidden" name="id" value={category.id} />
	<p class="text-slate-600">La categoría se eliminará del catálogo. Si tiene subcategorías, también se eliminarán.</p>
	{#if deleteFeedback?.message}<p class="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{deleteFeedback.message}</p>{/if}
	<div class="flex justify-end gap-2">
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger">Eliminar categoría</ActionButton>
	</div>
</form>
