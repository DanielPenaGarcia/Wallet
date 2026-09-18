<script lang="ts">
	import MenuIcon from '@lucide/svelte/icons/menu';
	import type { AppHeaderProps } from './props';

	let { currentPath, onOpenSidebar }: AppHeaderProps = $props();
</script>

<header class="sticky top-0 z-20 flex h-20 items-center border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
	<div class="flex min-w-0 items-center gap-3">
		<button
			type="button"
			class="grid size-10 shrink-0 place-items-center rounded-md border border-slate-300 text-slate-700 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none lg:hidden"
			onclick={onOpenSidebar}
			aria-label="Abrir menú principal"
		>
			<MenuIcon class="size-5" />
		</button>

		<div class="min-w-0">
			<p class="truncate text-sm font-semibold text-slate-500">Mi Cartera</p>
			<h1 class="truncate text-lg font-bold text-slate-950">
				{currentPath === '/' ? 'Inicio' : 'Sin secciones'}
			</h1>
		</div>
	</div>
</header>
