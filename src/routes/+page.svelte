<script lang="ts">
	import DashboardView from '$lib/modules/dashboard/components/dashboard-view/DashboardView.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<DashboardView summary={data.summary} />
