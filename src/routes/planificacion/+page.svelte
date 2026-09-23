<script lang="ts">
	import PlanningView from '$lib/modules/planning/components/planning-view/PlanningView.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<PlanningView planning={data.planning} />
