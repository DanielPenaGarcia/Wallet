import type { RecurringIncomeFormFeedback } from '../../types/recurring-income-form-feedback.types';
import type { RecurringIncome } from '../../types/recurring-income.types';

export type RecurringIncomeSectionProps = {
	incomes: RecurringIncome[];
	feedback?: RecurringIncomeFormFeedback | null;
};
