<script lang="ts">
	import type { AppSidebarProps } from './props';

	let { currentPath, isOpen, onClose }: AppSidebarProps = $props();

	const navigationItems = [
		{ label: 'Dashboard', href: '/dashboard', icon: 'dashboard', accent: 'blue' },
		{ label: 'Tarjetas', href: '/tarjetas', icon: 'cards', accent: 'green' },
		{ label: 'Movimientos', href: '/movimientos', icon: 'movements', accent: 'blue' },
		{ label: 'Finanzas', href: '/finanzas', icon: 'finance', accent: 'red' },
		{ label: 'Configuración', href: '/configuracion', icon: 'settings', accent: 'blue' }
	] as const;
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
		<p class="mb-3 px-3 text-[0.7rem] font-bold tracking-[0.16em] text-blue-200 uppercase">Menú principal</p>
		<ul class="space-y-1.5">
			{#each navigationItems as item}
				{@const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`)}
				<li>
					<a
						href={item.href}
						onclick={onClose}
						aria-current={isActive ? 'page' : undefined}
						class="group flex items-center gap-3 rounded-md border-l-4 px-3 py-3 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none {isActive
							? item.accent === 'green'
								? 'border-emerald-400 bg-white text-slate-900 shadow-sm'
								: item.accent === 'red'
									? 'border-red-500 bg-white text-slate-900 shadow-sm'
									: 'border-blue-400 bg-white text-slate-900 shadow-sm'
							: 'border-transparent text-blue-50 hover:bg-white/10 hover:text-white'}"
					>
						<span class="grid size-8 place-items-center rounded-md {isActive ? 'bg-slate-100' : 'bg-white/10'}">
							{#if item.icon === 'dashboard'}
								<svg viewBox="0 0 24 24" class="size-5" aria-hidden="true"><path d="M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-16v4h6V4h-6Z" fill="currentColor" /></svg>
							{:else if item.icon === 'cards'}
								<svg viewBox="0 0 24 24" class="size-5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2" /><path d="M3 9h18M7 15h4" fill="none" stroke="currentColor" stroke-width="2" /></svg>
							{:else if item.icon === 'finance'}
								<svg viewBox="0 0 24 24" class="size-5" aria-hidden="true"><path d="M4 19V9m5 10V5m6 14v-7m5 7V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /><path d="M3 19h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
							{:else if item.icon === 'movements'}
								<svg viewBox="0 0 24 24" class="size-5" aria-hidden="true"><path d="M7 7h11m0 0-3-3m3 3-3 3M17 17H6m0 0 3 3m-3-3 3-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
							{:else}
								<svg viewBox="0 0 24 24" class="size-5" aria-hidden="true"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15a1.7 1.7 0 0 0-1.55-1H3v-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63a1.7 1.7 0 0 0 1-1.55V3h4v.08A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9a1.7 1.7 0 0 0 1.55 1H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" /></svg>
							{/if}
						</span>
						{item.label}
					</a>
				</li>
			{/each}
		</ul>
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
