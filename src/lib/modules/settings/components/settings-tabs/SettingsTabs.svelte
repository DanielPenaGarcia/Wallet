<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import BankSettings from '$lib/modules/banks/components/bank-settings/BankSettings.svelte';
	import type { SettingsTabsProps } from './props';

	let { banks, feedback = null }: SettingsTabsProps = $props();
</script>

<Tabs.Root value="banks" class="gap-5">
	<Tabs.List class="grid w-full grid-cols-1 gap-2 rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm group-data-horizontal/tabs:h-14 sm:w-fit sm:min-w-48">
		<Tabs.Trigger value="banks" class="h-8 px-4 py-3 font-bold">Bancos</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="banks">
		<BankSettings {banks} {feedback} />
	</Tabs.Content>
</Tabs.Root>
