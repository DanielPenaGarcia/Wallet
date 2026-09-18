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
		<Input id="edit-category-name" name="name" required maxlength={60} value={editFeedback?.values?.name || category.name} class="h-11 border-slate-300" aria-invalid={editFeedback?.errors?.name ? 'true' : undefined} />
		{#if editFeedback?.errors?.name}<span class="text-xs text-red-700">{editFeedback.errors.name[0]}</span>{/if}
	</div>
	{#if category.parentId}
		<input type="hidden" name="color" value="" />
	{:else}
		<div class="grid gap-2">
			<Label for="edit-category-color">Color</Label>
			<ColorInput id="edit-category-color" name="color" value={editFeedback?.values?.color || category.color || '#16a34a'} fallback={category.color || '#16a34a'} error={editFeedback?.errors?.color?.[0]} />
		</div>
	{/if}
	<label class="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
		<input
			name="isEssential"
			type="checkbox"
			value="true"
			checked={editFeedback?.values?.isEssential ?? category.isEssential}
			class="mt-0.5 size-4 rounded border-slate-300 accent-blue-700"
		/>
		<span>
			<span class="block font-semibold text-slate-900">Es esencial</span>
			<span class="block text-xs leading-5 text-slate-500">Marca esta opción si el gasto asociado vale la pena o es necesario.</span>
		</span>
	</label>
	{#if editFeedback?.message}<p class="text-sm font-semibold text-red-700">{editFeedback.message}</p>{/if}
	<div class="flex justify-end gap-2">
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit">Guardar cambios</ActionButton>
	</div>
</form>
