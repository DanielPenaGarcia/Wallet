import type { InstallmentPurchase } from '$lib/modules/installment-purchases/types/installment-purchase.types';
import type { CreateInstallmentPurchaseInput } from './inputs/create-installment-purchase.input';
import type { UpdateInstallmentPurchaseInput } from './inputs/update-installment-purchase.input';

export interface InstallmentPurchaseRepository {
	findById(id: string): Promise<InstallmentPurchase | undefined>;
	listByAccountId(accountId: string): Promise<InstallmentPurchase[]>;
	create(input: CreateInstallmentPurchaseInput): Promise<InstallmentPurchase>;
	update(input: UpdateInstallmentPurchaseInput): Promise<void>;
	delete(id: string): Promise<void>;
}
