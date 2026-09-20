<script lang="ts">
	import AccountSection from '$lib/modules/accounts/components/account-section/AccountSection.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<section class="grid gap-6">
	<div>
		<p class="text-sm font-semibold text-primary">Cuentas</p>
		<h2 class="mt-1 text-2xl font-bold text-on-background">Cuentas</h2>
		<p class="mt-2 text-sm text-on-surface-muted">Administra efectivo y cuentas de débito donde existe dinero real.</p>
	</div>

	<AccountSection accounts={data.accounts} banks={data.banks} feedback={form ?? null} />
</section>
