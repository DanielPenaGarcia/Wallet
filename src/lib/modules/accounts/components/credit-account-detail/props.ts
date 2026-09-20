import type { InstallmentPurchaseFormFeedback } from '$lib/modules/installment-purchases/types/installment-purchase-form-feedback.types';
import type { InstallmentPurchase } from '$lib/modules/installment-purchases/types/installment-purchase.types';
import type { CreditCardStatementFormFeedback, CreditCardStatementFormValues } from '$lib/modules/credit-card-statements/types/credit-card-statement-form-feedback.types';
import type { CreditCardProjection, CreditCardStatement } from '$lib/modules/credit-card-statements/types/credit-card-statement.types';
import type { Account } from '../../types/account.types';

export type CreditAccountDetailProps = {
	account: Account;
	purchases: InstallmentPurchase[];
	latestStatement: CreditCardStatement | null;
	statementHistory: CreditCardStatement[];
	projection: CreditCardProjection;
	statementDraft: Required<Pick<
		CreditCardStatementFormValues,
		'periodStartDate' | 'periodEndDate' | 'statementDate' | 'paymentDueDate'
	>>;
	feedback?: InstallmentPurchaseFormFeedback | CreditCardStatementFormFeedback | null;
};
