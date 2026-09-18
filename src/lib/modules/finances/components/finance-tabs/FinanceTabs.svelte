<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import ExpenseSection from '$lib/modules/expenses/components/expense-section/ExpenseSection.svelte';
	import IncomeSection from '$lib/modules/incomes/components/income-section/IncomeSection.svelte';
	import FinancialGoalSection from '$lib/modules/goals/components/financial-goal-section/FinancialGoalSection.svelte';
	import type { FinanceTabsProps } from './props';

	let {
		initialTab = 'income',
		incomes,
		incomeFeedback = null,
		expenses,
		categories,
		cards,
		expenseFeedback = null,
		goals,
		goalFeedback = null
	}: FinanceTabsProps = $props();
</script>

<Tabs.Root value={initialTab} class="gap-5">
	<Tabs.List class="grid w-full grid-cols-3 gap-2 rounded-lg border border-outline bg-surface p-1.5 shadow-sm group-data-horizontal/tabs:h-14 sm:w-fit sm:min-w-lg">
		<Tabs.Trigger
			value="income"
			class="h-8 px-4 py-3 font-bold"
		>Ingresos</Tabs.Trigger>
		<Tabs.Trigger
			value="expenses"
			class="h-8 px-4 py-3 font-bold"
		>Gastos</Tabs.Trigger>
		<Tabs.Trigger
			value="goals"
			class="h-8 px-4 py-3 font-bold"
		>Objetivos</Tabs.Trigger>
	</Tabs.List>

	<Tabs.Content value="income">
		<IncomeSection {incomes} feedback={incomeFeedback} />
	</Tabs.Content>

	<Tabs.Content value="expenses">
		<ExpenseSection {expenses} {categories} {cards} feedback={expenseFeedback} />
	</Tabs.Content>

	<Tabs.Content value="goals">
		<FinancialGoalSection {goals} feedback={goalFeedback} />
	</Tabs.Content>
</Tabs.Root>
