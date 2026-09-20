<script lang="ts">
	import FinancialGoalSection from '$lib/modules/goals/components/financial-goal-section/FinancialGoalSection.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<section class="grid gap-6">
	<div>
		<p class="text-sm font-semibold text-primary">Metas</p>
		<h2 class="mt-1 text-2xl font-bold text-on-background">Metas financieras</h2>
		<p class="mt-2 text-sm text-on-surface-muted">Registra objetivos para orientar el dinero libre disponible.</p>
	</div>

	<FinancialGoalSection goals={data.goals} planningPeriods={data.planningPeriods} feedback={form ?? null} />
</section>
