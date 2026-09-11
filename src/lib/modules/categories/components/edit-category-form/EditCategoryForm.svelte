<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { EditCategoryFormProps } from './props';

	let { category, feedback = null, onCancel }: EditCategoryFormProps = $props();
	let editFeedback = $derived(feedback?.action === 'update-category' ? feedback : null);
</script>

<form method="POST" action="?/updateCategory" class="grid gap-4">
	<input type="hidden" name="id" value={category.id} />
	<div class="grid gap-2">
		<Label for="edit-category-name">Nombre</Label>
		<Input id="edit-category-name" name="name" required maxlength={60} value={editFeedback?.values?.name || category.name} class="h-11 border-slate-300" aria-invalid={editFeedback?.errors?.name ? 'true' : undefined} />
		{#if editFeedback?.errors?.name}<span class="text-xs text-red-700">{editFeedback.errors.name[0]}</span>{/if}
	</div>
	<div class="grid gap-2">
		<Label for="edit-category-color">Color</Label>
		<Input id="edit-category-color" name="color" type="color" value={editFeedback?.values?.color || category.color} class="h-11 cursor-pointer border-slate-300 p-1" />
	</div>
	{#if editFeedback?.message}<p class="text-sm font-semibold text-red-700">{editFeedback.message}</p>{/if}
	<div class="flex justify-end gap-2">
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit">Guardar cambios</ActionButton>
	</div>
</form>
