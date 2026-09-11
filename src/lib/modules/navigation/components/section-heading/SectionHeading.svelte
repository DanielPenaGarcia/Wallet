<script lang="ts">
	import type { SectionHeadingProps } from './props';

	let { eyebrow, title, description, accent }: SectionHeadingProps = $props();
</script>

<section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
	<div class="h-1.5 {accent === 'green' ? 'bg-emerald-600' : accent === 'red' ? 'bg-red-600' : 'bg-blue-700'}"></div>
	<div class="p-6 sm:p-8">
		<p class="text-xs font-bold tracking-[0.14em] uppercase {accent === 'green' ? 'text-emerald-700' : accent === 'red' ? 'text-red-700' : 'text-blue-700'}">{eyebrow}</p>
		<h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
		<p class="mt-3 max-w-2xl leading-7 text-slate-600">{description}</p>
	</div>
</section>
