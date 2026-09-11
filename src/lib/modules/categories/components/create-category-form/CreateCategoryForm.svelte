<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import { ColorInput } from '$lib/components/ui/color-input';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { CreateCategoryFormProps } from './props';

	let { parent, feedback = null, onCancel }: CreateCategoryFormProps = $props();
	let createFeedback = $derived(feedback?.action === 'create-category' ? feedback : null);

	function fieldError(field: string) {
		return createFeedback?.errors?.[field]?.[0];
	}
</script>

<form method="POST" action="?/createCategory" class="grid gap-4">
	<input type="hidden" name="parentId" value={parent?.id ?? ''} />

	<div class="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-900">
		{#if parent}
			Se creará como hija de <strong>{parent.name}</strong>.
		{:else}
			Se creará como una categoría principal.
		{/if}
	</div>

	<div class="grid gap-2">
		<Label for="category-name">Nombre</Label>
		<Input id="category-name" name="name" required maxlength={60} value={createFeedback?.values?.name ?? ''} placeholder="Ej. Alimentación" class="h-11 border-slate-300" aria-invalid={fieldError('name') ? 'true' : undefined} />
		{#if fieldError('name')}<span class="text-xs text-red-700">{fieldError('name')}</span>{/if}
	</div>

	{#if parent}
		<input type="hidden" name="color" value={parent.color} />
	{:else}
		<div class="grid gap-2">
			<Label for="category-color">Color</Label>
			<ColorInput id="category-color" name="color" value={createFeedback?.values?.color ?? '#16a34a'} fallback="#16a34a" error={fieldError('color')} />
		</div>
	{/if}

	{#if createFeedback?.message}<p class="text-sm font-semibold text-red-700">{createFeedback.message}</p>{/if}

	<div class="flex justify-end gap-2">
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit">Guardar categoría</ActionButton>
	</div>
</form>
