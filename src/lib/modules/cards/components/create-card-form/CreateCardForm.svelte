<script lang="ts">
	import CardForm from '../card-form/CardForm.svelte';
	import type { CreateCardFormProps } from './props';

	let { banks, feedback = null }: CreateCardFormProps = $props();
</script>

<CardForm mode="create" {banks} {feedback} />
