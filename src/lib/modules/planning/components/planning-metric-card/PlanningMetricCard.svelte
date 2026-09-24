<script lang="ts">
	import type { PlanningMetricCardProps } from './props';

	let { label, value, description, icon }: PlanningMetricCardProps = $props();
</script>

<div class="rounded-lg border border-outline bg-surface p-4 shadow-sm sm:p-5">
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0">
			<p class="text-sm font-semibold text-on-surface-muted">{label}</p>
			<p class="mt-2 break-words text-xl font-bold text-on-surface sm:text-2xl">{value}</p>
		</div>
		{#if icon}
			<span class="shrink-0">{@render icon()}</span>
		{/if}
	</div>
	<p class="mt-3 break-words text-xs text-on-surface-muted">{description}</p>
</div>
