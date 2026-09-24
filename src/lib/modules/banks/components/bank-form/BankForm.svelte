<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import ColorInput from '$lib/components/ui/color-input/ColorInput.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { BankFormProps } from './props';

	let { mode, bank, feedback = null, onCancel }: BankFormProps = $props();
	let expectedAction = $derived(mode === 'create' ? 'create-bank' : 'update-bank');
	let matchingFeedback = $derived(
		feedback?.action === expectedAction && (mode === 'create' || feedback.targetId === bank?.id)
			? feedback
			: null
	);
	let idPrefix = $derived(mode === 'create' ? 'create-bank' : `edit-bank-${bank?.id ?? ''}`);

	function fieldError(field: string) {
		return matchingFeedback?.errors?.[field]?.[0];
	}
</script>

<form method="POST" action={mode === 'create' ? '?/createBank' : '?/updateBank'} class="grid gap-4">
	{#if mode === 'edit' && bank}<input type="hidden" name="id" value={bank.id} />{/if}
	<div class="grid gap-2">
		<Label for={`${idPrefix}-name`}>Nombre</Label>
		<Input
			id={`${idPrefix}-name`}
			name="name"
			required
			maxlength={100}
			value={matchingFeedback?.values?.name ?? bank?.name ?? ''}
			placeholder="Ej. Nu"
			class="h-11 border-outline"
			aria-invalid={fieldError('name') ? 'true' : undefined}
		/>
		{#if fieldError('name')}<span class="text-xs text-destructive">{fieldError('name')}</span>{/if}
	</div>

	<div class="grid gap-2">
		<Label for={`${idPrefix}-alias`}>Alias</Label>
		<Input
			id={`${idPrefix}-alias`}
			name="alias"
			required
			maxlength={40}
			value={matchingFeedback?.values?.alias ?? bank?.alias ?? ''}
			placeholder="Ej. NU"
			class="h-11 border-outline"
			aria-invalid={fieldError('alias') ? 'true' : undefined}
		/>
		{#if fieldError('alias')}<span class="text-xs text-destructive">{fieldError('alias')}</span>{/if}
	</div>

	<div class="grid gap-2">
		<Label for={`${idPrefix}-color`}>Color</Label>
		<ColorInput
			id={`${idPrefix}-color`}
			name="color"
			value={matchingFeedback?.values?.color ?? bank?.color ?? '#2563eb'}
			error={fieldError('color')}
		/>
	</div>

	{#if matchingFeedback?.message}<p class="break-words rounded-md bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">{matchingFeedback.message}</p>{/if}

	<div class="grid gap-2 sm:flex sm:justify-end">
		{#if onCancel}<ActionButton type="button" intent="secondary" class="w-full sm:w-auto" onclick={onCancel}>Cancelar</ActionButton>{/if}
		<ActionButton type="submit" class="w-full sm:w-auto">{mode === 'create' ? 'Registrar' : 'Guardar cambios'}</ActionButton>
	</div>
</form>
