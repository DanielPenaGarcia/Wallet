<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import AppHeader from '$lib/modules/navigation/components/app-header/AppHeader.svelte';
	import AppSidebar from '$lib/modules/navigation/components/app-sidebar/AppSidebar.svelte';

	let { children } = $props();
	let sidebarOpen = $state(false);
	let currentPath = $derived(page.url.pathname);
</script>

<div class="min-h-screen bg-slate-50 lg:flex">
	<AppSidebar {currentPath} isOpen={sidebarOpen} onClose={() => (sidebarOpen = false)} />
	<div class="min-w-0 flex-1">
		<AppHeader {currentPath} onOpenSidebar={() => (sidebarOpen = true)} />
		<main class="px-4 py-6 sm:px-6 lg:px-8">
			{@render children()}
		</main>
	</div>
</div>
