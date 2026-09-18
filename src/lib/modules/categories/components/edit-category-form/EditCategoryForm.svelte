<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import { ColorInput } from '$lib/components/ui/color-input';
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
		<Input id="edit-category-name" name="name" required maxlength={60} value={editFeedback?.values?.name || category.name} class="h-11 border-outline" aria-invalid={editFeedback?.errors?.name ? 'true' : undefined} />
		{#if editFeedback?.errors?.name}<span class="text-xs text-destructive">{editFeedback.errors.name[0]}</span>{/if}
	</div>
	{#if category.parentId}
		<input type="hidden" name="color" value="" />
	{:else}
		<div class="grid gap-2">
			<Label for="edit-category-color">Color</Label>
			<ColorInput id="edit-category-color" name="color" value={editFeedback?.values?.color || category.color || '#16a34a'} fallback={category.color || '#16a34a'} error={editFeedback?.errors?.color?.[0]} />
		</div>
	{/if}
	<label class="flex items-start gap-3 rounded-md border border-outline bg-surface-subtle px-3 py-3 text-sm text-on-surface-variant">
		<input
			name="isEssential"
			type="checkbox"
			value="true"
			checked={editFeedback?.values?.isEssential ?? category.isEssential}
			class="mt-0.5 size-4 rounded border-outline accent-primary"
		/>
		<span>
			<span class="block font-semibold text-on-surface">Es esencial</span>
			<span class="block text-xs leading-5 text-on-surface-muted">Marca esta opción si el gasto asociado vale la pena o es necesario.</span>
		</span>
	</label>
	{#if editFeedback?.message}<p class="text-sm font-semibold text-destructive">{editFeedback.message}</p>{/if}
	<div class="flex justify-end gap-2">
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit">Guardar cambios</ActionButton>
	</div>
</form>
