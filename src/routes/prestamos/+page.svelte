<script lang="ts">
	import SectionHeading from '$lib/modules/navigation/components/section-heading/SectionHeading.svelte';
	import LoanSection from '$lib/modules/loans/components/loan-section/LoanSection.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="grid gap-6">
	<SectionHeading
		eyebrow="Deuda y cobranza"
		title="Préstamos"
		description="Controla dinero recibido por pagar y dinero prestado por cobrar sin duplicar ingresos ni gastos."
		accent="primary"
	/>

	<LoanSection loans={data.loans} cards={data.cards} feedback={form ?? null} />
</div>
