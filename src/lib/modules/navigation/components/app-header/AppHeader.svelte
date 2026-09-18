<script lang="ts">
	import MenuIcon from '@lucide/svelte/icons/menu';
	import type { AppHeaderProps } from './props';

	let { currentPath, onOpenSidebar }: AppHeaderProps = $props();
</script>

<header class="sticky top-0 z-20 flex h-20 items-center border-b border-outline bg-surface px-4 shadow-sm sm:px-6 lg:px-8">
	<div class="flex min-w-0 items-center gap-3">
		<button
			type="button"
			class="grid size-10 shrink-0 place-items-center rounded-md border border-outline text-on-surface-variant transition hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none lg:hidden"
			onclick={onOpenSidebar}
			aria-label="Abrir menú principal"
		>
			<MenuIcon class="size-5" />
		</button>

		<div class="min-w-0">
			<p class="truncate text-sm font-semibold text-on-surface-muted">Mi Cartera</p>
			<h1 class="truncate text-lg font-bold text-on-surface">
				{currentPath.startsWith('/settings') ? 'Settings' : 'Inicio'}
			</h1>
		</div>
	</div>
</header>
