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

<div class="flex justify-end gap-2 sm:col-span-2">
	{#if mode === 'create' && onBack}
		<ActionButton type="button" intent="secondary" onclick={onBack}>Cambiar tipo</ActionButton>
	{/if}
	{#if mode === 'edit' && onCancel}
		<ActionButton type="button" intent="secondary" onclick={onCancel}>Cancelar</ActionButton>
	{/if}
	<ActionButton type="submit" {disabled}>{submitLabel}</ActionButton>
</div>
