<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import {
		getMobileMoreNavigationItems,
		getMobilePrimaryNavigationItems
	} from '$lib/modules/navigation/navigation-items';
	import type { AppMobileTabsProps } from './props';

	let { currentPath }: AppMobileTabsProps = $props();
	let moreOpen = $state(false);
	let primaryItems = getMobilePrimaryNavigationItems();
	let moreItems = getMobileMoreNavigationItems();
	let isMoreActive = $derived(moreItems.some((item) => item.isActive(currentPath)));

	$effect(() => {
		currentPath;
		moreOpen = false;
	});
</script>

<nav
	class="fixed inset-x-0 bottom-0 z-30 border-t border-outline bg-surface/95 shadow-[0_-10px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden"
	aria-label="Navegación principal"
>
	{#if moreOpen}
		<div
			id="mobile-more-navigation"
			class="absolute inset-x-3 bottom-[calc(100%+0.5rem)] rounded-lg border border-outline bg-surface p-2 shadow-xl"
		>
			<div class="grid grid-cols-2 gap-2">
				{#each moreItems as item (item.href)}
					{@const Icon = item.icon}
					{@const isActive = item.isActive(currentPath)}
					<a
						href={item.href}
						class="flex min-h-12 items-center gap-3 rounded-md px-3 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none {isActive ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-hover hover:text-on-surface'}"
						aria-current={isActive ? 'page' : undefined}
						onclick={() => (moreOpen = false)}
					>
						<Icon class="size-5" />
						{item.mobileLabel}
					</a>
				{/each}
			</div>
		</div>
	{/if}

	<div class="grid min-h-18 grid-cols-5 gap-1 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
		{#each primaryItems as item (item.href)}
			{@const Icon = item.icon}
			{@const isActive = item.isActive(currentPath)}
			<a
				href={item.href}
				class="grid place-items-center gap-1 rounded-md px-1 py-2 text-[0.68rem] leading-none font-semibold transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none {isActive ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-muted hover:bg-surface-hover hover:text-on-surface'}"
				aria-current={isActive ? 'page' : undefined}
				title={item.title}
			>
				<Icon class="size-5" />
				<span>{item.mobileLabel}</span>
			</a>
		{/each}
		<button
			type="button"
			class="grid place-items-center gap-1 rounded-md px-1 py-2 text-[0.68rem] leading-none font-semibold transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none {isMoreActive || moreOpen ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-muted hover:bg-surface-hover hover:text-on-surface'}"
			aria-controls="mobile-more-navigation"
			aria-expanded={moreOpen}
			aria-current={isMoreActive ? 'page' : undefined}
			onclick={() => (moreOpen = !moreOpen)}
		>
			<EllipsisIcon class="size-5" />
			<span>Más</span>
		</button>
	</div>
</nav>
