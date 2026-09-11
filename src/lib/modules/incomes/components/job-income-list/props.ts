import type { JobIncome } from '../../types/job-income.types';

export type JobIncomeListProps = {
	incomes: JobIncome[];
	onCreate: () => void;
	onEdit: (income: JobIncome) => void;
	onDelete: (income: JobIncome) => void;
};
