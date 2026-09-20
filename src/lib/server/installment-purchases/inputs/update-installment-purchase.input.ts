import type { CreateInstallmentPurchaseInput } from './create-installment-purchase.input';

export type UpdateInstallmentPurchaseInput = CreateInstallmentPurchaseInput & {
	id: string;
};
