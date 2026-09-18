<script lang="ts">
	import type { SectionHeadingProps } from './props';

	let { eyebrow, title, description, accent }: SectionHeadingProps = $props();
</script>

<section class="overflow-hidden rounded-lg border border-outline bg-surface shadow-sm">
	<div class="h-1.5 {accent === 'secondary' ? 'bg-secondary' : accent === 'destructive' ? 'bg-destructive' : 'bg-primary'}"></div>
	<div class="p-6 sm:p-8">
		<p class="text-xs font-bold tracking-[0.14em] uppercase {accent === 'secondary' ? 'text-secondary' : accent === 'destructive' ? 'text-destructive' : 'text-primary'}">{eyebrow}</p>
		<h1 class="mt-2 text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">{title}</h1>
		<p class="mt-3 max-w-2xl leading-7 text-on-surface-muted">{description}</p>
	</div>
</section>
