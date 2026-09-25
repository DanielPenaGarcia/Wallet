<script lang="ts">
	import LoanDetail from '$lib/modules/loans/components/loan-detail/LoanDetail.svelte';
	import { localFormFeedback } from '$lib/local/finance-db';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<LoanDetail loan={data.loan} cards={data.cards} movements={data.movements} feedback={$localFormFeedback as never} />
