import type { RecurringIncome } from '../../types/recurring-income.types';
import type { RecurringIncomeFormFeedback } from '../../types/recurring-income-form-feedback.types';

export type RecurringIncomeFormProps = {
	mode: 'create' | 'edit';
	income?: RecurringIncome;
	feedback?: RecurringIncomeFormFeedback | null;
	onCancel?: () => void;
};
