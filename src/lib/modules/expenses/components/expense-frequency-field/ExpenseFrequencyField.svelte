<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import {
		expenseFrequencyOptions,
		expenseIntervalUnitOptions
	} from '../../utils/expense-form-options';
	import type { ExpenseFrequencyFieldProps } from './props';

	let {
		idPrefix,
		frequency = $bindable(),
		customIntervalCount = $bindable(),
		customIntervalUnit = $bindable(),
		frequencyError,
		customIntervalCountError,
		customIntervalUnitError
	}: ExpenseFrequencyFieldProps = $props();

	let selectedFrequency = $derived(
		expenseFrequencyOptions.find((option) => option.value === frequency)?.label ??
			'Selecciona una frecuencia'
	);
	let selectedUnit = $derived(
		expenseIntervalUnitOptions.find((option) => option.value === customIntervalUnit)?.label ??
			'Selecciona una unidad'
	);

	function updateCustomIntervalCount(event: Event) {
		const input = event.currentTarget;
		if (input instanceof HTMLInputElement) customIntervalCount = input.value;
	}
</script>

<div class="grid gap-2">
	<Label for={`${idPrefix}-frequency`}>Frecuencia</Label>
	<Select.Root type="single" name="frequency" required bind:value={frequency} items={expenseFrequencyOptions}>
		<Select.Trigger id={`${idPrefix}-frequency`} class="h-11 w-full border-outline px-3" aria-invalid={frequencyError ? 'true' : undefined} aria-describedby={frequencyError ? `${idPrefix}-frequency-error` : undefined}>
			<span>{selectedFrequency}</span>
		</Select.Trigger>
		<Select.Content>
			{#each expenseFrequencyOptions as option}
				<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
	{#if frequencyError}<span id={`${idPrefix}-frequency-error`} class="text-xs text-destructive">{frequencyError}</span>{/if}
</div>

{#if frequency === 'custom'}
	<div class="grid gap-2">
		<Label for={`${idPrefix}-custom-interval-count`}>Veces</Label>
		<Input
			id={`${idPrefix}-custom-interval-count`}
			name="customIntervalCount"
			type="number"
			required
			min="1"
			max="999"
			step="1"
			value={customIntervalCount}
			oninput={updateCustomIntervalCount}
			placeholder="Ej. 2"
			class="h-11 border-outline"
			aria-invalid={customIntervalCountError ? 'true' : undefined}
			aria-describedby={customIntervalCountError ? `${idPrefix}-custom-interval-count-error` : undefined}
		/>
		{#if customIntervalCountError}<span id={`${idPrefix}-custom-interval-count-error`} class="text-xs text-destructive">{customIntervalCountError}</span>{/if}
	</div>

	<div class="grid gap-2">
		<Label for={`${idPrefix}-custom-interval-unit`}>Periodo</Label>
		<Select.Root type="single" name="customIntervalUnit" required bind:value={customIntervalUnit} items={expenseIntervalUnitOptions}>
			<Select.Trigger id={`${idPrefix}-custom-interval-unit`} class="h-11 w-full border-outline px-3" aria-invalid={customIntervalUnitError ? 'true' : undefined} aria-describedby={customIntervalUnitError ? `${idPrefix}-custom-interval-unit-error` : undefined}>
				<span>{selectedUnit}</span>
			</Select.Trigger>
			<Select.Content>
				{#each expenseIntervalUnitOptions as option}
					<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
		{#if customIntervalUnitError}<span id={`${idPrefix}-custom-interval-unit-error`} class="text-xs text-destructive">{customIntervalUnitError}</span>{/if}
	</div>
{/if}
