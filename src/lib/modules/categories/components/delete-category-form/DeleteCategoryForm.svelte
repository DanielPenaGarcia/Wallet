<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { DeleteCategoryFormProps } from './props';

	let { category, feedback = null, onCancel }: DeleteCategoryFormProps = $props();
	let deleteFeedback = $derived(feedback?.action === 'delete-category' ? feedback : null);
</script>

<form method="POST" action="?/deleteCategory" class="grid gap-4">
	<input type="hidden" name="id" value={category.id} />
	<p class="break-words text-on-surface-variant">La categoría se eliminará del catálogo solo si no tiene subcategorías ni gastos recurrentes asociados.</p>
	{#if deleteFeedback?.message}<p class="break-words rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{deleteFeedback.message}</p>{/if}
	<div class="grid gap-2 sm:flex sm:justify-end">
		<ActionButton type="button" intent="secondary" class="w-full sm:w-auto" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" intent="danger" class="w-full sm:w-auto">Eliminar categoría</ActionButton>
	</div>
</form>
