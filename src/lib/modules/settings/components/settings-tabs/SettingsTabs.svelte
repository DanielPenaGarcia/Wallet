<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import BankSettings from '$lib/modules/banks/components/bank-settings/BankSettings.svelte';
	import CategorySettings from '$lib/modules/categories/components/category-settings/CategorySettings.svelte';
	import type { BankFormFeedback } from '$lib/modules/banks/types/bank-form-feedback.types';
	import type { CategoryFormFeedback } from '$lib/modules/categories/types/category-form-feedback.types';
	import type { SettingsTabsProps } from './props';

	let { banks, categories, categoryTree, feedback = null }: SettingsTabsProps = $props();
	let isCategoryAction = $derived(feedback?.action?.endsWith('-category') ?? false);
</script>

<Tabs.Root value={isCategoryAction ? 'categories' : 'banks'} class="gap-5">
	<Tabs.List class="grid w-full grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm group-data-horizontal/tabs:h-14 sm:w-fit sm:min-w-md">
		<Tabs.Trigger value="banks" class="h-8 px-4 py-3 font-bold">Bancos</Tabs.Trigger>
		<Tabs.Trigger value="categories" class="h-8 px-4 py-3 font-bold">Categorías</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="banks">
		<BankSettings {banks} feedback={isCategoryAction ? null : (feedback as BankFormFeedback | null)} />
	</Tabs.Content>
	<Tabs.Content value="categories">
		<CategorySettings {categories} {categoryTree} feedback={isCategoryAction ? (feedback as CategoryFormFeedback) : null} />
	</Tabs.Content>
</Tabs.Root>
