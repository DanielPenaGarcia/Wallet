<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
	import { formatCardListItemLabel } from '$lib/modules/cards/utils/card-list-item-label';
	import type { CardSelectFieldProps } from './props';

	let {
		id,
		name,
		label,
		cards,
		value = $bindable(),
		error,
		placeholder = 'Selecciona una cuenta',
		required = true,
		emptyLabel,
		class: className = ''
	}: CardSelectFieldProps = $props();

	function cardLabel(card: CardListItem) {
		return formatCardListItemLabel(card, { includeCurrency: true });
	}

	let selectedCard = $derived(cards.find((card) => card.id === value));
	let items = $derived([
		...(emptyLabel ? [{ value: '', label: emptyLabel }] : []),
		...cards.map((card) => ({ value: card.id, label: cardLabel(card) }))
	]);
</script>

<div class={`grid gap-2 ${className}`}>
	<Label for={id}>{label}</Label>
	<Select.Root type="single" {name} {required} bind:value items={items}>
		<Select.Trigger id={id} class="h-11 w-full border-outline px-3" aria-invalid={error ? 'true' : undefined}>
			<span class="truncate">{selectedCard ? cardLabel(selectedCard) : (value === '' && emptyLabel ? emptyLabel : placeholder)}</span>
		</Select.Trigger>
		<Select.Content>
			{#if emptyLabel}
				<Select.Item value="" label={emptyLabel}>{emptyLabel}</Select.Item>
			{/if}
			{#each cards as card}
				<Select.Item value={card.id} label={cardLabel(card)}>{cardLabel(card)}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
	{#if error}<span class="text-xs text-destructive">{error}</span>{/if}
</div>
