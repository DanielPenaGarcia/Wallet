import { asc, eq } from 'drizzle-orm';
import type { InstallmentPurchase } from '$lib/modules/installment-purchases/types/installment-purchase.types';
import { db, type Database } from '$lib/server/db';
import { installmentPurchases } from '$lib/server/db/schema';
import type { CreateInstallmentPurchaseInput } from './inputs/create-installment-purchase.input';
import type { UpdateInstallmentPurchaseInput } from './inputs/update-installment-purchase.input';
import type { InstallmentPurchaseRepository } from './installment-purchase.repository';

class DrizzleInstallmentPurchaseRepository implements InstallmentPurchaseRepository {
	constructor(private readonly database: Database = db) {}

	async findById(id: string) {
		const [purchase] = await this.database
			.select()
			.from(installmentPurchases)
			.where(eq(installmentPurchases.id, id))
			.limit(1);

		return purchase ? this.toInstallmentPurchase(purchase) : undefined;
	}

	async listByAccountId(accountId: string) {
		const purchases = await this.database
			.select()
			.from(installmentPurchases)
			.where(eq(installmentPurchases.accountId, accountId))
			.orderBy(asc(installmentPurchases.purchaseDate), asc(installmentPurchases.description));

		return purchases.map((purchase) => this.toInstallmentPurchase(purchase));
	}

	async create(input: CreateInstallmentPurchaseInput) {
		const now = new Date().toISOString();
		const purchase = {
			id: crypto.randomUUID(),
			accountId: input.accountId,
			description: input.description,
			purchaseDate: input.purchaseDate,
			originalAmountCents: input.originalAmountCents,
			installmentAmountCents: input.installmentAmountCents,
			totalInstallments: input.totalInstallments,
			billedInstallments: input.billedInstallments,
			paidInstallments: input.paidInstallments,
			createdAt: now,
			updatedAt: now
		};

		await this.database.insert(installmentPurchases).values(purchase);
		return this.toInstallmentPurchase(purchase);
	}

	async update(input: UpdateInstallmentPurchaseInput): Promise<void> {
		await this.database
			.update(installmentPurchases)
			.set({
				accountId: input.accountId,
				description: input.description,
				purchaseDate: input.purchaseDate,
				originalAmountCents: input.originalAmountCents,
				installmentAmountCents: input.installmentAmountCents,
				totalInstallments: input.totalInstallments,
				billedInstallments: input.billedInstallments,
				paidInstallments: input.paidInstallments,
				updatedAt: new Date().toISOString()
			})
			.where(eq(installmentPurchases.id, input.id));
	}

	async delete(id: string): Promise<void> {
		await this.database.delete(installmentPurchases).where(eq(installmentPurchases.id, id));
	}

	private toInstallmentPurchase(purchase: typeof installmentPurchases.$inferSelect): InstallmentPurchase {
		return {
			id: purchase.id,
			accountId: purchase.accountId,
			description: purchase.description,
			purchaseDate: purchase.purchaseDate,
			originalAmountCents: purchase.originalAmountCents,
			installmentAmountCents: purchase.installmentAmountCents,
			totalInstallments: purchase.totalInstallments,
			billedInstallments: purchase.billedInstallments,
			paidInstallments: purchase.paidInstallments,
			createdAt: purchase.createdAt,
			updatedAt: purchase.updatedAt
		};
	}
}

export const drizzleInstallmentPurchaseRepository = new DrizzleInstallmentPurchaseRepository();
