<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { currentDateTimeLocal } from '$lib/shared/utils/date-time-local';
	import type { MovementCommonFieldsProps } from './props';

	let {
		idPrefix,
		titleValue = '',
		amountValue = '',
		occurredAtValue = '',
		errors = {}
	}: MovementCommonFieldsProps = $props();
	let occurredAt = $state(untrack(() => occurredAtValue));

	onMount(() => {
		if (!occurredAt) occurredAt = currentDateTimeLocal();
	});

	function fieldError(field: string) {
		return errors[field]?.[0];
	}
</script>

<div class="grid gap-2 sm:col-span-2">
	<Label for={`${idPrefix}-title`}>Título</Label>
	<Input
		id={`${idPrefix}-title`}
		name="title"
		required
		maxlength={100}
		value={titleValue}
		placeholder="Ej. Botana en la tienda"
		class="h-11 border-slate-300"
		aria-invalid={fieldError('title') ? 'true' : undefined}
	/>
	{#if fieldError('title')}<span class="text-xs text-red-700">{fieldError('title')}</span>{/if}
</div>

<div class="grid gap-2">
	<Label for={`${idPrefix}-amount`}>Monto</Label>
	<Input
		id={`${idPrefix}-amount`}
		name="amount"
		required
		type="number"
		min="0.01"
		step="0.01"
		value={amountValue}
		placeholder="0.00"
		class="h-11 border-slate-300"
		aria-invalid={fieldError('amount') ? 'true' : undefined}
	/>
	{#if fieldError('amount')}<span class="text-xs text-red-700">{fieldError('amount')}</span>{/if}
</div>

<div class="grid gap-2">
	<Label for={`${idPrefix}-occurred-at`}>Fecha y hora</Label>
	<Input
		id={`${idPrefix}-occurred-at`}
		name="occurredAt"
		required
		type="datetime-local"
		bind:value={occurredAt}
		class="h-11 border-slate-300"
		aria-invalid={fieldError('occurredAt') ? 'true' : undefined}
	/>
	{#if fieldError('occurredAt')}<span class="text-xs text-red-700">{fieldError('occurredAt')}</span>{/if}
</div>
