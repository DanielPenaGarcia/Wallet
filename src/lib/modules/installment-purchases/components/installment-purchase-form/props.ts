import type { InstallmentPurchaseFormFeedback } from '../../types/installment-purchase-form-feedback.types';
import type { InstallmentPurchase } from '../../types/installment-purchase.types';

export type InstallmentPurchaseFormProps = {
	mode: 'create' | 'edit';
	accountId: string;
	purchase?: InstallmentPurchase;
	feedback?: InstallmentPurchaseFormFeedback | null;
	onCancel?: () => void;
};
