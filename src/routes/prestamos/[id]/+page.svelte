<script lang="ts">
	import LoanDetail from '$lib/modules/loans/components/loan-detail/LoanDetail.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<LoanDetail loan={data.loan} cards={data.cards} movements={data.movements} feedback={form ?? null} />
