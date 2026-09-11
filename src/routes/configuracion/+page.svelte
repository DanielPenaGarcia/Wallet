<script lang="ts">
	import SettingsTabs from '$lib/modules/settings/components/settings-tabs/SettingsTabs.svelte';

	let { data, form } = $props();
</script>

<svelte:head><title>Configuración | Mi Cartera</title></svelte:head>

<div class="space-y-6">

	<SettingsTabs banks={data.banks} categories={data.categories} categoryTree={data.categoryTree} feedback={form} />
</div>
