<script lang="ts">
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import type { AppSidebarProps } from './props';

	let { currentPath, isOpen, onClose }: AppSidebarProps = $props();
	let isSettingsActive = $derived(currentPath.startsWith('/settings'));
</script>

{#if isOpen}
	<button
		type="button"
		class="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
		onclick={onClose}
		aria-label="Cerrar menú principal"
	></button>
{/if}

<aside
	class="fixed inset-y-0 left-0 z-40 flex w-68 -translate-x-full flex-col border-r border-blue-950 bg-[#123a63] text-white shadow-xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 {isOpen ? 'translate-x-0' : ''}"
	aria-label="Navegación principal"
>
	<div class="flex h-20 shrink-0 items-center border-b border-white/15 px-5">
		<div class="grid size-11 place-items-center rounded-lg bg-white text-[#123a63] shadow-sm">
			<svg viewBox="0 0 24 24" class="size-6" aria-hidden="true">
				<path d="M4 7.5h14.5A1.5 1.5 0 0 1 20 9v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18V7.5Zm0 0V6a1.5 1.5 0 0 1 1.5-1.5H17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
				<path d="M15.5 12h4.5v4h-4.5a2 2 0 1 1 0-4Z" fill="#2f9e62" />
			</svg>
		</div>
		<div class="ml-3">
			<p class="text-lg font-bold tracking-tight">Mi Cartera</p>
			<p class="text-xs text-blue-100">Finanzas personales</p>
		</div>
		<button
			type="button"
			class="ml-auto grid size-9 place-items-center rounded-md text-blue-100 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none lg:hidden"
			onclick={onClose}
			aria-label="Cerrar menú principal"
		>
			<svg viewBox="0 0 24 24" class="size-5" aria-hidden="true">
				<path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
			</svg>
		</button>
	</div>

	<nav class="flex-1 px-3 py-6">
		<a
			href="/settings"
			class="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition {isSettingsActive ? 'bg-white text-[#123a63] shadow-sm' : 'text-blue-50 hover:bg-white/10'}"
			onclick={onClose}
			aria-current={isSettingsActive ? 'page' : undefined}
		>
			<SettingsIcon class="size-5" />
			Settings
		</a>
	</nav>

	<div class="border-t border-white/15 p-4">
		<div class="rounded-lg bg-[#0d2d4d] p-3">
			<div class="flex items-center gap-3">
				<span class="grid size-9 place-items-center rounded-full bg-emerald-500 text-sm font-bold">MC</span>
				<div class="min-w-0">
					<p class="truncate text-sm font-semibold">Mi cuenta</p>
					<p class="truncate text-xs text-blue-200">Sesión personal</p>
				</div>
			</div>
		</div>
	</div>
</aside>
