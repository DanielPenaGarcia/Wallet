<script lang="ts">
	import SectionHeading from '$lib/modules/navigation/components/section-heading/SectionHeading.svelte';
	import MovementSection from '$lib/modules/movements/components/movement-section/MovementSection.svelte';
	import type { MovementFormFeedback } from '$lib/modules/movements/types/movement-form-feedback.types';

	let { data, form } = $props();
</script>

<svelte:head><title>Movimientos | Mi Cartera</title></svelte:head>

<div class="space-y-6">
	<MovementSection
		movements={data.movements}
		cards={data.cards}
		expenses={data.expenses}
		categories={data.categories}
		filters={data.filters}
		feedback={form as MovementFormFeedback | null}
	/>
</div>
