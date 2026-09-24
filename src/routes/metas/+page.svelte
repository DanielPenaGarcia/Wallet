<script lang="ts">
	import FinancialGoalSection from '$lib/modules/goals/components/financial-goal-section/FinancialGoalSection.svelte';
	import SectionHeading from '$lib/modules/navigation/components/section-heading/SectionHeading.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<section class="grid gap-6">
	<SectionHeading
		eyebrow="Metas"
		title="Metas financieras"
		description="Registra objetivos para orientar el dinero libre disponible."
		accent="primary"
	/>

	<FinancialGoalSection goals={data.goals} planningPeriods={data.planningPeriods} feedback={form ?? null} />
</section>
