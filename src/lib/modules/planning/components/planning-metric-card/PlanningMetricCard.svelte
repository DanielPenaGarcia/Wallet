<script lang="ts">
	import type { PlanningMetricCardProps } from './props';

	let { label, value, description, icon }: PlanningMetricCardProps = $props();
</script>

<div class="rounded-lg border border-outline bg-surface p-5 shadow-sm">
	<div class="flex items-start justify-between gap-3">
		<div>
			<p class="text-sm font-semibold text-on-surface-muted">{label}</p>
			<p class="mt-2 text-2xl font-bold text-on-surface">{value}</p>
		</div>
		{#if icon}
			{@render icon()}
		{/if}
	</div>
	<p class="mt-3 text-xs text-on-surface-muted">{description}</p>
</div>
