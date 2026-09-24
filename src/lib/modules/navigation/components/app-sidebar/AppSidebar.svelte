<script lang="ts">
	import { browser } from '$app/environment';
	import {
		applicationProfileChangedEvent,
		applicationProfileInitials,
		defaultApplicationProfile,
		readApplicationProfile,
		shortApplicationProfileName,
		type ApplicationProfile
	} from '$lib/shared/utils/application-profile';
	import { navigationItems } from '$lib/modules/navigation/navigation-items';
	import type { AppSidebarProps } from './props';

	let { currentPath }: AppSidebarProps = $props();
	let applicationProfile = $state(defaultApplicationProfile);
	let sidebarProfileName = $derived(shortApplicationProfileName(applicationProfile));
	let sidebarProfileInitials = $derived(applicationProfileInitials(applicationProfile));

	$effect(() => {
		if (!browser) return;

		applicationProfile = readApplicationProfile(localStorage);

		function handleStorage(event: StorageEvent) {
			if (event.storageArea !== localStorage) return;
			applicationProfile = readApplicationProfile(localStorage);
		}

		function handleProfileChanged(event: Event) {
			applicationProfile = event instanceof CustomEvent
				? event.detail as ApplicationProfile
				: readApplicationProfile(localStorage);
		}

		window.addEventListener('storage', handleStorage);
		window.addEventListener(applicationProfileChangedEvent, handleProfileChanged);

		return () => {
			window.removeEventListener('storage', handleStorage);
			window.removeEventListener(applicationProfileChangedEvent, handleProfileChanged);
		};
	});
</script>

<aside
	class="sticky top-0 hidden h-screen w-68 flex-col border-r border-primary-pressed bg-primary text-on-primary shadow-xl lg:flex"
	aria-label="Navegación principal"
>
	<div class="flex h-20 shrink-0 items-center border-b border-on-primary/15 px-5">
		<div class="grid size-11 place-items-center rounded-lg bg-on-primary text-primary shadow-sm">
			<svg viewBox="0 0 24 24" class="size-6" aria-hidden="true">
				<path d="M4 7.5h14.5A1.5 1.5 0 0 1 20 9v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18V7.5Zm0 0V6a1.5 1.5 0 0 1 1.5-1.5H17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
				<path d="M15.5 12h4.5v4h-4.5a2 2 0 1 1 0-4Z" class="fill-secondary" />
			</svg>
		</div>
		<div class="ml-3">
			<p class="text-lg font-bold tracking-tight">Mi Cartera</p>
			<p class="text-xs text-on-primary/75">Finanzas personales</p>
		</div>
	</div>

	<nav class="grid flex-1 content-start gap-1 px-3 py-6">
		{#each navigationItems as item (item.href)}
			{@const Icon = item.icon}
			{@const isActive = item.isActive(currentPath)}
			<a
				href={item.href}
				class="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition {isActive ? 'bg-on-primary text-primary shadow-sm' : 'text-on-primary/90 hover:bg-on-primary/10'}"
				aria-current={isActive ? 'page' : undefined}
			>
				<Icon class="size-5" />
				{item.sidebarLabel}
			</a>
		{/each}
	</nav>

	<div class="border-t border-on-primary/15 p-4">
		<div class="rounded-lg bg-primary-pressed p-3">
			<div class="flex items-center gap-3">
				<span class="grid size-9 place-items-center rounded-full bg-secondary text-sm font-bold text-on-secondary">{sidebarProfileInitials}</span>
				<div class="min-w-0">
					<p class="truncate text-sm font-semibold">{sidebarProfileName}</p>
					<p class="truncate text-xs text-on-primary/70">Sesión personal</p>
				</div>
			</div>
		</div>
	</div>
</aside>
