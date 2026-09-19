import type { RecurringIncomeFormFeedback } from '../../types/recurring-income-form-feedback.types';
import type { RecurringIncome } from '../../types/recurring-income.types';

export type DeleteRecurringIncomeFormProps = {
	income: RecurringIncome;
	feedback?: RecurringIncomeFormFeedback | null;
	onCancel: () => void;
};
