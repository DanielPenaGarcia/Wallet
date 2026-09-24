<script lang="ts">
	import AccountSection from '$lib/modules/accounts/components/account-section/AccountSection.svelte';
	import SectionHeading from '$lib/modules/navigation/components/section-heading/SectionHeading.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<section class="grid gap-6">
	<SectionHeading
		eyebrow="Cuentas"
		title="Cuentas"
		description="Administra efectivo, cuentas de débito y tarjetas de crédito."
		accent="primary"
	/>

	<AccountSection accounts={data.accounts} banks={data.banks} feedback={form ?? null} />
</section>
