import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import type { Category } from '$lib/modules/categories/types/category.types';
import type { ExpenseFormFeedback } from '$lib/modules/expenses/types/expense-form-feedback.types';
import type { Expense } from '$lib/modules/expenses/types/expense.types';
import type { JobIncome } from '$lib/modules/incomes/types/job-income.types';
import type { IncomeFormFeedback } from '$lib/modules/incomes/types/income-form-feedback.types';
import type { FinancialGoal } from '$lib/modules/goals/types/financial-goal.types';
import type { GoalFormFeedback } from '$lib/modules/goals/types/goal-form-feedback.types';

export type FinanceTab = 'income' | 'expenses' | 'goals';

export type FinanceTabsProps = {
	initialTab?: FinanceTab;
	incomes: JobIncome[];
	incomeFeedback?: IncomeFormFeedback | null;
	expenses: Expense[];
	categories: Category[];
	cards: CardListItem[];
	expenseFeedback?: ExpenseFormFeedback | null;
	goals: FinancialGoal[];
	goalFeedback?: GoalFormFeedback | null;
};
