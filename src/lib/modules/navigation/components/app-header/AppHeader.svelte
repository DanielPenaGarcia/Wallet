<script lang="ts">
	import { getActiveNavigationItem } from '$lib/modules/navigation/navigation-items';
	import type { AppHeaderProps } from './props';

	let { currentPath }: AppHeaderProps = $props();
	let pageTitle = $derived(getActiveNavigationItem(currentPath)?.title ?? 'Inicio');
</script>

<header class="sticky top-0 z-20 flex h-20 items-center border-b border-outline bg-surface px-4 shadow-sm sm:px-6 lg:px-8">
	<div class="flex min-w-0 items-center gap-3">
		<div class="min-w-0">
			<p class="truncate text-sm font-semibold text-on-surface-muted">Mi Cartera</p>
			<h1 class="truncate text-lg font-bold text-on-surface">
				{pageTitle}
			</h1>
		</div>
	</div>
</header>
