<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import AppHeader from '$lib/modules/navigation/components/app-header/AppHeader.svelte';
	import AppSidebar from '$lib/modules/navigation/components/app-sidebar/AppSidebar.svelte';
	import { applyCssVariables, colorPaletteStorageKey } from '$lib/shared/utils/color-palette';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();
	let sidebarOpen = $state(false);
	let currentPath = $derived(page.url.pathname);
	let selectedColorPaletteId = $state<string | null>(null);
	let colorPaletteHeadScript = $derived(
		'<script>' + buildColorPaletteHeadScript(data.colorPaletteCssVariables) + '</' + 'script>'
	);

	$effect(() => {
		if (!browser) return;
		const storedColorPaletteId = localStorage.getItem(colorPaletteStorageKey);
		selectedColorPaletteId = data.colorPaletteCssVariables.some((palette) => palette.id === storedColorPaletteId)
			? storedColorPaletteId
			: data.defaultColorPaletteId;
	});

	$effect(() => {
		if (!browser || !selectedColorPaletteId) return;
		const selectedColorPalette = data.colorPaletteCssVariables.find((palette) => palette.id === selectedColorPaletteId);
		if (!selectedColorPalette) return;
		applyCssVariables(document.documentElement.style, selectedColorPalette.variables);
	});

	function safeJson(value: unknown) {
		return JSON.stringify(value).replaceAll('<', '\\u003c');
	}

	function buildColorPaletteHeadScript(colorPalettes: LayoutData['colorPaletteCssVariables']) {
		return `
(() => {
	try {
		const storageKey = ${JSON.stringify(colorPaletteStorageKey)};
		const palettes = ${safeJson(colorPalettes)};
		const storedPaletteId = window.localStorage.getItem(storageKey);
		let palette = palettes.find((item) => item.id === storedPaletteId);
		if (!palette) {
			palette = palettes.find((item) => item.isDefault) ?? palettes[0];
			if (storedPaletteId) window.localStorage.removeItem(storageKey);
		}
		if (!palette) return;
		for (const [name, value] of Object.entries(palette.variables)) {
			document.documentElement.style.setProperty(name, value);
		}
	} catch {
	}
})();
`;
	}
</script>

<svelte:head>
	{@html colorPaletteHeadScript}
</svelte:head>

<div class="min-h-screen bg-background text-on-background lg:flex">
	<AppSidebar {currentPath} isOpen={sidebarOpen} onClose={() => (sidebarOpen = false)} />
	<div class="min-w-0 flex-1">
		<AppHeader {currentPath} onOpenSidebar={() => (sidebarOpen = true)} />
		<main class="px-4 py-6 sm:px-6 lg:px-8">
			{@render children()}
		</main>
	</div>
</div>
