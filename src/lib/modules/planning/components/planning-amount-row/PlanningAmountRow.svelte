<script lang="ts">
	import type { PlanningAmountRowProps } from './props';

	let { title, meta, amount, detail }: PlanningAmountRowProps = $props();
</script>

<div class="grid gap-2 rounded-md bg-surface-subtle p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
	<div class="min-w-0">
		<p class="break-words font-bold text-on-surface">{title}</p>
		<p class="mt-1 break-words text-xs text-on-surface-muted">{meta}</p>
	</div>
	<div class="min-w-0 text-left md:text-right">
		<p class="break-words font-bold text-on-surface">{amount}</p>
		{#if detail}<p class="break-words text-xs text-on-surface-muted">{detail}</p>{/if}
	</div>
</div>
