<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import AppHeader from '$lib/modules/navigation/components/app-header/AppHeader.svelte';
	import AppSidebar from '$lib/modules/navigation/components/app-sidebar/AppSidebar.svelte';

	let { children, data } = $props();
	let sidebarOpen = $state(false);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#123a63" />
</svelte:head>

<div class="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[17rem_1fr]">
	<AppSidebar
		currentPath={page.url.pathname}
		isOpen={sidebarOpen}
		onClose={() => (sidebarOpen = false)}
	/>

	<div class="min-w-0">
		<AppHeader
			currentPath={page.url.pathname}
			nextIncomePayment={data.nextIncomePayment}
			onOpenSidebar={() => (sidebarOpen = true)}
		/>

		<main class="min-h-[calc(100vh-5rem)] p-4 sm:p-6 lg:p-8">
			<div class="mx-auto max-w-6xl">{@render children()}</div>
		</main>
	</div>
</div>
