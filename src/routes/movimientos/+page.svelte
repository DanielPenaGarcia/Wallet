<script lang="ts">
	import SectionHeading from '$lib/modules/navigation/components/section-heading/SectionHeading.svelte';
	import MovementSection from '$lib/modules/movements/components/movement-section/MovementSection.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="grid gap-6">
	<SectionHeading
		eyebrow="Operaciones"
		title="Movimientos"
		description="Registra y corrige operaciones reales sin recalcular saldos desde el historial."
		accent="primary"
	/>

	<MovementSection
		movements={data.movements}
		cards={data.cards}
		expenses={data.expenses}
		categories={data.categories}
		filters={data.filters}
		feedback={form ?? null}
	/>
</div>
