import type { LoanFormFeedback } from '../../types/loan-form-feedback.types';
import type { LoanSummary } from '../../types/loan.types';

export type DeleteLoanFormProps = {
	loan: LoanSummary;
	feedback?: LoanFormFeedback | null;
	onCancel: () => void;
};
