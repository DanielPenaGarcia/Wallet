<script lang="ts">
	import CreditAccountDetail from '$lib/modules/accounts/components/credit-account-detail/CreditAccountDetail.svelte';
	import { localFormFeedback } from '$lib/local/finance-db';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<section class="grid gap-6">
	<CreditAccountDetail
		account={data.account}
		purchases={data.purchases}
		latestStatement={data.latestStatement}
		statementHistory={data.statementHistory}
	projection={data.projection}
	statementDraft={data.statementDraft}
	feedback={$localFormFeedback as never}
/>
</section>
