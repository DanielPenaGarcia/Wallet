<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { expenseAmountKindOptions } from '../../utils/expense-form-options';
	import type { ExpenseAmountKindFieldProps } from './props';

	let { id, value = $bindable(), error }: ExpenseAmountKindFieldProps = $props();
	let selectedLabel = $derived(
		expenseAmountKindOptions.find((option) => option.value === value)?.label ??
			'Selecciona un tipo'
	);
</script>

<div class="grid gap-2">
	<Label for={id}>Tipo de importe</Label>
	<Select.Root type="single" name="amountKind" required bind:value items={expenseAmountKindOptions}>
		<Select.Trigger {id} class="h-11 w-full border-slate-300 px-3" aria-invalid={error ? 'true' : undefined}>
			<span>{selectedLabel}</span>
		</Select.Trigger>
		<Select.Content>
			{#each expenseAmountKindOptions as option}
				<Select.Item value={option.value} label={option.label}>{option.label}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
	{#if error}<span class="text-xs text-red-700">{error}</span>{/if}
</div>
