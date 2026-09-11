<script lang="ts">
	import SectionHeading from '$lib/modules/navigation/components/section-heading/SectionHeading.svelte';
	import ReserveTabs from '$lib/modules/reserves/components/reserve-tabs/ReserveTabs.svelte';
	import type { ReserveMovementFeedback } from '$lib/modules/reserves/types/reserve-movement-feedback.types';

	let { data, form } = $props();
	let feedback = $derived(form ? (form as ReserveMovementFeedback) : null);
</script>

<svelte:head><title>Apartados | Mi Cartera</title></svelte:head>

<div class="space-y-6">
	<SectionHeading
		eyebrow="Apartados"
		title="Apartados"
		description="Revisa lo que debes separar para cuentas de crédito y gastos activos."
		accent="blue"
	/>

	<ReserveTabs summary={data.summary} debitCards={data.debitCards} {feedback} />
</div>
