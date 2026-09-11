<script lang="ts">
	import CardForm from '../card-form/CardForm.svelte';
	import type { EditCardFormProps } from './props';

	let { card, banks, feedback = null, onCancel }: EditCardFormProps = $props();
</script>

<CardForm mode="edit" {card} {banks} {feedback} {onCancel} />
