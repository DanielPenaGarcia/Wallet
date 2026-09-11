import type { IncomeFormFeedback } from '../../types/income-form-feedback.types';
import type { JobIncome } from '../../types/job-income.types';

export type DeleteJobIncomeFormProps = {
	income: JobIncome;
	feedback?: IncomeFormFeedback | null;
	onCancel: () => void;
};
