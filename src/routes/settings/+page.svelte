<script lang="ts">
	import SettingsTabs from '$lib/modules/settings/components/settings-tabs/SettingsTabs.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<section class="grid gap-6">
	<div>
		<p class="text-sm font-semibold text-primary">Settings</p>
		<h2 class="mt-1 text-2xl font-bold text-on-background">Configuración</h2>
		<p class="mt-2 text-sm text-on-surface-muted">Administra los catálogos base de la aplicación.</p>
	</div>

	<SettingsTabs
		banks={data.banks}
		categories={data.categories}
		categoryTree={data.categoryTree}
		colorPalettes={data.colorPalettes}
		selectedColorPaletteId={data.selectedColorPaletteId}
		feedback={form ?? null}
	/>
</section>
