<script lang="ts">
	import { browser } from '$app/environment';
	import HomeIcon from '@lucide/svelte/icons/house';
	import LandmarkIcon from '@lucide/svelte/icons/landmark';
	import ListIcon from '@lucide/svelte/icons/list';
	import RepeatIcon from '@lucide/svelte/icons/repeat';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import TargetIcon from '@lucide/svelte/icons/target';
	import {
		applicationProfileChangedEvent,
		applicationProfileInitials,
		defaultApplicationProfile,
		readApplicationProfile,
		shortApplicationProfileName,
		type ApplicationProfile
	} from '$lib/shared/utils/application-profile';
	import type { AppSidebarProps } from './props';

	let { currentPath, isOpen, onClose }: AppSidebarProps = $props();
	let isHomeActive = $derived(currentPath === '/');
	let isRecurringActive = $derived(currentPath.startsWith('/recurrentes'));
	let isMovementsActive = $derived(currentPath.startsWith('/movimientos'));
	let isGoalsActive = $derived(currentPath.startsWith('/metas'));
	let isAccountsActive = $derived(currentPath.startsWith('/cuentas'));
	let isSettingsActive = $derived(currentPath.startsWith('/settings'));
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

{#if isOpen}
	<button
		type="button"
		class="fixed inset-0 z-30 bg-on-background/50 lg:hidden"
		onclick={onClose}
		aria-label="Cerrar menú principal"
	></button>
{/if}

<aside
	class="fixed inset-y-0 left-0 z-40 flex w-68 -translate-x-full flex-col border-r border-primary-pressed bg-primary text-on-primary shadow-xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 {isOpen ? 'translate-x-0' : ''}"
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
		<button
			type="button"
			class="ml-auto grid size-9 place-items-center rounded-md text-on-primary/80 hover:bg-on-primary/10 focus-visible:ring-2 focus-visible:ring-on-primary focus-visible:outline-none lg:hidden"
			onclick={onClose}
			aria-label="Cerrar menú principal"
		>
			<svg viewBox="0 0 24 24" class="size-5" aria-hidden="true">
				<path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
			</svg>
		</button>
	</div>

	<nav class="grid flex-1 content-start gap-1 px-3 py-6">
		<a
			href="/"
			class="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition {isHomeActive ? 'bg-on-primary text-primary shadow-sm' : 'text-on-primary/90 hover:bg-on-primary/10'}"
			onclick={onClose}
			aria-current={isHomeActive ? 'page' : undefined}
		>
			<HomeIcon class="size-5" />
			Dashboard
		</a>
		<a
			href="/recurrentes"
			class="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition {isRecurringActive ? 'bg-on-primary text-primary shadow-sm' : 'text-on-primary/90 hover:bg-on-primary/10'}"
			onclick={onClose}
			aria-current={isRecurringActive ? 'page' : undefined}
		>
			<RepeatIcon class="size-5" />
			Recurrentes
		</a>
		<a
			href="/movimientos"
			class="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition {isMovementsActive ? 'bg-on-primary text-primary shadow-sm' : 'text-on-primary/90 hover:bg-on-primary/10'}"
			onclick={onClose}
			aria-current={isMovementsActive ? 'page' : undefined}
		>
			<ListIcon class="size-5" />
			Movimientos
		</a>
		<a
			href="/metas"
			class="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition {isGoalsActive ? 'bg-on-primary text-primary shadow-sm' : 'text-on-primary/90 hover:bg-on-primary/10'}"
			onclick={onClose}
			aria-current={isGoalsActive ? 'page' : undefined}
		>
			<TargetIcon class="size-5" />
			Metas
		</a>
		<a
			href="/cuentas"
			class="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition {isAccountsActive ? 'bg-on-primary text-primary shadow-sm' : 'text-on-primary/90 hover:bg-on-primary/10'}"
			onclick={onClose}
			aria-current={isAccountsActive ? 'page' : undefined}
		>
			<LandmarkIcon class="size-5" />
			Cuentas
		</a>
		<a
			href="/settings"
			class="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition {isSettingsActive ? 'bg-on-primary text-primary shadow-sm' : 'text-on-primary/90 hover:bg-on-primary/10'}"
			onclick={onClose}
			aria-current={isSettingsActive ? 'page' : undefined}
		>
			<SettingsIcon class="size-5" />
			Settings
		</a>
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
