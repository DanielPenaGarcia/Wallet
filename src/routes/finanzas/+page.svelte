<script lang="ts">
	import FinanceTabs from '$lib/modules/finances/components/finance-tabs/FinanceTabs.svelte';
	import type { ExpenseFormFeedback } from '$lib/modules/expenses/types/expense-form-feedback.types';
	import type { IncomeFormFeedback } from '$lib/modules/incomes/types/income-form-feedback.types';
	import type { GoalFormFeedback } from '$lib/modules/goals/types/goal-form-feedback.types';

	let { data, form } = $props();
	let isExpenseAction = $derived(
			form?.action === 'create-expense' ||
			form?.action === 'update-expense' ||
			form?.action === 'delete-expense' ||
			form?.action === 'pay-expense'
	);
	let expenseFeedback = $derived(isExpenseAction ? (form as ExpenseFormFeedback) : null);
	let isGoalAction = $derived(
		form?.action === 'create-goal' || form?.action === 'update-goal' || form?.action === 'delete-goal'
	);
	let goalFeedback = $derived(isGoalAction ? (form as GoalFormFeedback) : null);
	let incomeFeedback = $derived(isExpenseAction || isGoalAction || !form ? null : (form as IncomeFormFeedback));
</script>

<svelte:head><title>Finanzas | Mi Cartera</title></svelte:head>

<div class="space-y-6">
	<FinanceTabs
		initialTab={isExpenseAction ? 'expenses' : isGoalAction ? 'goals' : 'income'}
		incomes={data.incomes}
		{incomeFeedback}
		expenses={data.expenses}
		categories={data.categories}
		cards={data.cards}
		{expenseFeedback}
		goals={data.goals}
		{goalFeedback}
	/>
</div>
