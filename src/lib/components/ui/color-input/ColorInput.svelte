<script lang="ts">
	import { untrack } from 'svelte';
	import { Input } from '$lib/components/ui/input';
	import { normalizeColorInput, type HexColor } from '$lib/shared/utils/color';

	type ColorInputProps = {
		id: string;
		name: string;
		value?: string;
		fallback?: HexColor;
		error?: string;
		required?: boolean;
		class?: string;
	};

	let {
		id,
		name,
		value = '#64748b',
		fallback = '#64748b',
		error,
		required = true,
		class: className = ''
	}: ColorInputProps = $props();

	let textValue = $state(untrack(() => value));
	let swatchValue = $derived(normalizeColorInput(textValue, fallback));

	function pickColor(event: Event) {
		const input = event.currentTarget;
		if (!(input instanceof HTMLInputElement)) return;
		textValue = input.value;
	}
</script>

<div class={`grid gap-2 ${className}`}>
	<div class="flex gap-2">
		<Input
			{id}
			{name}
			{required}
			bind:value={textValue}
			placeholder="#16a34a o rgb(22, 163, 74)"
			class="h-11 border-slate-300 font-mono"
			aria-invalid={error ? 'true' : undefined}
		/>
		<input
			type="color"
			value={swatchValue}
			oninput={pickColor}
			class="h-11 w-14 shrink-0 cursor-pointer rounded-md border border-slate-300 bg-transparent p-1 shadow-xs outline-none focus-visible:border-blue-600 focus-visible:ring-3 focus-visible:ring-blue-600/50"
			aria-label="Seleccionar color"
		/>
	</div>
	{#if error}<span class="text-xs text-red-700">{error}</span>{/if}
</div>
