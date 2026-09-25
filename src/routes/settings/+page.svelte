<script lang="ts">
	import SectionHeading from '$lib/modules/navigation/components/section-heading/SectionHeading.svelte';
	import SettingsTabs from '$lib/modules/settings/components/settings-tabs/SettingsTabs.svelte';
	import { localFormFeedback } from '$lib/local/finance-db';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<section class="grid gap-6">
	<SectionHeading
		eyebrow="Settings"
		title="Configuración"
		description="Administra los catálogos base de la aplicación."
		accent="primary"
	/>

	<SettingsTabs
		banks={data.banks}
		categories={data.categories}
		categoryTree={data.categoryTree}
		colorPalettes={data.colorPalettes}
		selectedColorPaletteId={data.selectedColorPaletteId}
		feedback={$localFormFeedback}
	/>
</section>
