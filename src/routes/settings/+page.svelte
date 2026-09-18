<script lang="ts">
	import SettingsTabs from '$lib/modules/settings/components/settings-tabs/SettingsTabs.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<section class="grid gap-6">
	<div>
		<p class="text-sm font-semibold text-blue-700">Settings</p>
		<h2 class="mt-1 text-2xl font-bold text-slate-950">Configuración</h2>
		<p class="mt-2 text-sm text-slate-600">Administra los catálogos base de la aplicación.</p>
	</div>

	<SettingsTabs banks={data.banks} feedback={form ?? null} />
</section>
