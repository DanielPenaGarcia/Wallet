import type { RecurringIncome } from '../../types/recurring-income.types';

export type RecurringIncomeListProps = {
	incomes: RecurringIncome[];
	onCreate: () => void;
	onEdit: (income: RecurringIncome) => void;
	onDelete: (income: RecurringIncome) => void;
};
