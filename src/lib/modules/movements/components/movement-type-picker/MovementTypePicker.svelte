<script lang="ts">
	import ArrowDownLeftIcon from '@lucide/svelte/icons/arrow-down-left';
	import ArrowLeftRightIcon from '@lucide/svelte/icons/arrow-left-right';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import SlidersHorizontalIcon from '@lucide/svelte/icons/sliders-horizontal';
	import { ActionButton } from '$lib/components/ui/action-button';
	import type { MovementTypePickerProps } from './props';

	let { onSelect }: MovementTypePickerProps = $props();
</script>

<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
	<ActionButton type="button" intent="secondary" onclick={() => onSelect('expense')}>
		<ArrowUpRightIcon /> Gasto
	</ActionButton>
	<ActionButton type="button" intent="secondary" onclick={() => onSelect('income')}>
		<ArrowDownLeftIcon /> Ingreso
	</ActionButton>
	<ActionButton type="button" intent="secondary" onclick={() => onSelect('transfer')}>
		<ArrowLeftRightIcon /> Transferencia
	</ActionButton>
	<ActionButton type="button" intent="secondary" onclick={() => onSelect('credit_purchase')}>
		<CreditCardIcon /> Compra crédito
	</ActionButton>
	<ActionButton type="button" intent="secondary" onclick={() => onSelect('credit_card_payment')}>
		<CreditCardIcon /> Pago tarjeta
	</ActionButton>
	<ActionButton type="button" intent="secondary" onclick={() => onSelect('adjustment')}>
		<SlidersHorizontalIcon /> Ajuste
	</ActionButton>
</div>
