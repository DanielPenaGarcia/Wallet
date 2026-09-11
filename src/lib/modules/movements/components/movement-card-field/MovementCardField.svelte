<script lang="ts">
	import CardSelectField from '$lib/modules/cards/components/card-select-field/CardSelectField.svelte';
	import type { MovementCardFieldProps } from './props';

	let { id, name, label, cards, value = $bindable(), error }: MovementCardFieldProps = $props();
</script>

<CardSelectField {id} {name} {label} {cards} bind:value {error} class="sm:col-span-2" />
