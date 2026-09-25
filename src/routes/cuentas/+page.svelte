<script lang="ts">
	import AccountSection from '$lib/modules/accounts/components/account-section/AccountSection.svelte';
	import { localFormFeedback } from '$lib/local/finance-db';
	import SectionHeading from '$lib/modules/navigation/components/section-heading/SectionHeading.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<section class="grid gap-6">
	<SectionHeading
		eyebrow="Cuentas"
		title="Cuentas"
		description="Administra efectivo, cuentas de débito y tarjetas de crédito."
		accent="primary"
	/>

	<AccountSection accounts={data.accounts} banks={data.banks} feedback={$localFormFeedback as never} />
</section>
