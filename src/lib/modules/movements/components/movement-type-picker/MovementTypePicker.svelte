<script lang="ts">
	import ArrowDownLeftIcon from '@lucide/svelte/icons/arrow-down-left';
	import ArrowLeftRightIcon from '@lucide/svelte/icons/arrow-left-right';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import SlidersHorizontalIcon from '@lucide/svelte/icons/sliders-horizontal';
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { MovementTypePickerProps } from './props';

	let { onSelect, allowedTypes }: MovementTypePickerProps = $props();

	function canSelect(type: Parameters<typeof onSelect>[0]) {
		return !allowedTypes || allowedTypes.includes(type);
	}
</script>

<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
	{#if canSelect('expense')}
		<ActionButton type="button" intent="secondary" onclick={() => onSelect('expense')}>
			<ArrowUpRightIcon /> Gasto
		</ActionButton>
	{/if}
	{#if canSelect('income')}
		<ActionButton type="button" intent="secondary" onclick={() => onSelect('income')}>
			<ArrowDownLeftIcon /> Ingreso
		</ActionButton>
	{/if}
	{#if canSelect('transfer')}
		<ActionButton type="button" intent="secondary" onclick={() => onSelect('transfer')}>
			<ArrowLeftRightIcon /> Transferencia
		</ActionButton>
	{/if}
	{#if canSelect('credit_purchase')}
		<ActionButton type="button" intent="secondary" onclick={() => onSelect('credit_purchase')}>
			<CreditCardIcon /> Compra crédito
		</ActionButton>
	{/if}
	{#if canSelect('credit_card_payment')}
		<ActionButton type="button" intent="secondary" onclick={() => onSelect('credit_card_payment')}>
			<CreditCardIcon /> Pago tarjeta
		</ActionButton>
	{/if}
	{#if canSelect('adjustment')}
		<ActionButton type="button" intent="secondary" onclick={() => onSelect('adjustment')}>
			<SlidersHorizontalIcon /> Ajuste
		</ActionButton>
	{/if}
</div>
