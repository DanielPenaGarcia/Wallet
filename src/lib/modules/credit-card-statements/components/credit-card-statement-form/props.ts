import type { CreditCardStatementFormFeedback, CreditCardStatementFormValues } from '../../types/credit-card-statement-form-feedback.types';
import type { CreditCardStatement } from '../../types/credit-card-statement.types';

export type CreditCardStatementFormProps = {
	mode: 'create' | 'edit';
	accountId: string;
	statement?: CreditCardStatement;
	defaultValues: Required<Pick<
		CreditCardStatementFormValues,
		'periodStartDate' | 'periodEndDate' | 'statementDate' | 'paymentDueDate'
	>>;
	feedback?: CreditCardStatementFormFeedback | null;
	onCancel?: () => void;
};
