<script lang="ts">
	import type { PlanningAmountRowProps } from './props';

	let { title, meta, amount, detail }: PlanningAmountRowProps = $props();
</script>

<div class="grid gap-2 rounded-md bg-surface-subtle p-4 sm:grid-cols-[1fr_auto] sm:items-center">
	<div class="min-w-0">
		<p class="truncate font-bold text-on-surface">{title}</p>
		<p class="mt-1 text-xs text-on-surface-muted">{meta}</p>
	</div>
	<div class="text-left sm:text-right">
		<p class="font-bold text-on-surface">{amount}</p>
		{#if detail}<p class="text-xs text-on-surface-muted">{detail}</p>{/if}
	</div>
</div>
