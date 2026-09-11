<script lang="ts">
	import type { ProjectIntroductionProps } from './props';

	let { title, description }: ProjectIntroductionProps = $props();
</script>

<section class="space-y-4">
	<p class="text-sm font-medium tracking-wide text-muted-foreground uppercase">Proyecto iniciado</p>
	<h1 class="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">{title}</h1>
	<p class="max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p>
</section>
