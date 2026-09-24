<script lang="ts">
	import ReceiptTextIcon from '@lucide/svelte/icons/receipt-text';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import * as Tabs from '$lib/components/ui/tabs';
	import SectionHeading from '$lib/modules/navigation/components/section-heading/SectionHeading.svelte';
	import RecurringExpenseSection from '$lib/modules/recurring-expenses/components/recurring-expense-section/RecurringExpenseSection.svelte';
	import type { RecurringExpenseFormFeedback } from '$lib/modules/recurring-expenses/types/recurring-expense-form-feedback.types';
	import RecurringIncomeSection from '$lib/modules/recurring-incomes/components/recurring-income-section/RecurringIncomeSection.svelte';
	import type { RecurringIncomeFormFeedback } from '$lib/modules/recurring-incomes/types/recurring-income-form-feedback.types';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let defaultTab = $derived(form?.action?.endsWith('recurring-income') ? 'income' : 'expenses');
	let expenseFeedback = $derived(
		form?.action?.endsWith('recurring-expense') ? (form as RecurringExpenseFormFeedback) : null
	);
	let incomeFeedback = $derived(
		form?.action?.endsWith('recurring-income') ? (form as RecurringIncomeFormFeedback) : null
	);
</script>

<section class="grid gap-6">
	<SectionHeading
		eyebrow="Recurrentes"
		title="Recurrentes"
		description="Organiza movimientos periódicos de gastos e ingresos."
		accent="primary"
	/>

	<Tabs.Root value={defaultTab} class="gap-5">
		<Tabs.List
			class="grid h-auto w-full grid-cols-2 gap-2 rounded-lg border border-outline bg-surface p-1.5 shadow-sm sm:w-fit sm:min-w-80"
		>
			<Tabs.Trigger value="expenses" class="h-10 px-3 py-2 font-bold">
				<ReceiptTextIcon class="size-4" />
				Gastos
			</Tabs.Trigger>
			<Tabs.Trigger value="income" class="h-10 px-3 py-2 font-bold">
				<TrendingUpIcon class="size-4" />
				Ingresos
			</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="expenses">
			<RecurringExpenseSection
				expenses={data.recurringExpenses}
				categories={data.categories}
				paymentAccounts={data.paymentAccounts}
				feedback={expenseFeedback}
			/>
		</Tabs.Content>

		<Tabs.Content value="income">
			<RecurringIncomeSection incomes={data.recurringIncomes} feedback={incomeFeedback} />
		</Tabs.Content>
	</Tabs.Root>
</section>
