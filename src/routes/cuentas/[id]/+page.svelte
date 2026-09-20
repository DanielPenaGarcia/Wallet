<script lang="ts">
	import CreditAccountDetail from '$lib/modules/accounts/components/credit-account-detail/CreditAccountDetail.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<section class="grid gap-6">
	<CreditAccountDetail
		account={data.account}
		purchases={data.purchases}
		latestStatement={data.latestStatement}
		statementHistory={data.statementHistory}
		projection={data.projection}
		statementDraft={data.statementDraft}
		feedback={form ?? null}
	/>
</section>
