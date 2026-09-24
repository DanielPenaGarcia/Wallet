<script lang="ts">
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { MovementFormActionsProps } from './props';

	let {
		mode,
		submitLabel,
		disabled = false,
		onBack,
		onCancel
	}: MovementFormActionsProps = $props();
</script>

<div class="grid gap-2 sm:col-span-2 sm:flex sm:justify-end">
	{#if mode === 'create' && onBack}
		<ActionButton type="button" intent="secondary" class="w-full sm:w-auto" onclick={onBack}>Cambiar tipo</ActionButton>
	{/if}
	{#if mode === 'edit' && onCancel}
		<ActionButton type="button" intent="secondary" class="w-full sm:w-auto" onclick={onCancel}>Cancelar</ActionButton>
	{/if}
	<ActionButton type="submit" class="w-full sm:w-auto" {disabled}>{submitLabel}</ActionButton>
</div>
