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

	<div class="break-words rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
		{#if parent}
			Se creará como hija de <strong>{parent.name}</strong>.
		{:else}
			Se creará como una categoría principal.
		{/if}
	</div>

	<div class="grid gap-2">
		<Label for="category-name">Nombre</Label>
		<Input id="category-name" name="name" required maxlength={60} value={createFeedback?.values?.name ?? ''} placeholder="Ej. Alimentación" class="h-11 border-outline" aria-invalid={fieldError('name') ? 'true' : undefined} />
		{#if fieldError('name')}<span class="text-xs text-destructive">{fieldError('name')}</span>{/if}
	</div>

	{#if parent}
		<input type="hidden" name="color" value="" />
	{:else}
		<div class="grid gap-2">
			<Label for="category-color">Color</Label>
			<ColorInput id="category-color" name="color" value={createFeedback?.values?.color ?? '#16a34a'} fallback="#16a34a" error={fieldError('color')} />
		</div>
	{/if}

	<label class="flex items-start gap-3 rounded-md border border-outline bg-surface-subtle px-3 py-3 text-sm text-on-surface-variant">
		<input
			name="isEssential"
			type="checkbox"
			value="true"
			checked={createFeedback?.values?.isEssential ?? false}
			class="mt-0.5 size-4 rounded border-outline accent-primary"
		/>
		<span>
			<span class="block font-semibold text-on-surface">Es esencial</span>
			<span class="block text-xs leading-5 text-on-surface-muted">Marca esta opción si el gasto asociado vale la pena o es necesario.</span>
		</span>
	</label>

	{#if createFeedback?.message}<p class="break-words text-sm font-semibold text-destructive">{createFeedback.message}</p>{/if}

	<div class="grid gap-2 sm:flex sm:justify-end">
		<ActionButton type="button" intent="secondary" class="w-full sm:w-auto" onclick={onCancel}>Cancelar</ActionButton>
		<ActionButton type="submit" class="w-full sm:w-auto">Guardar categoría</ActionButton>
	</div>
</form>
