import type { IncomeFormFeedback } from '../../types/income-form-feedback.types';
import type { JobIncome } from '../../types/job-income.types';

export type EditJobIncomeFormProps = {
	income: JobIncome;
	feedback?: IncomeFormFeedback | null;
	onCancel: () => void;
};
