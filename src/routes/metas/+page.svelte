<script lang="ts">
	import FinancialGoalSection from '$lib/modules/goals/components/financial-goal-section/FinancialGoalSection.svelte';
	import { localFormFeedback } from '$lib/local/finance-db';
	import SectionHeading from '$lib/modules/navigation/components/section-heading/SectionHeading.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<section class="grid gap-6">
	<SectionHeading
		eyebrow="Metas"
		title="Metas financieras"
		description="Registra objetivos para orientar el dinero libre disponible."
		accent="primary"
	/>

	<FinancialGoalSection goals={data.goals} planningPeriods={data.planningPeriods} feedback={$localFormFeedback as never} />
</section>
