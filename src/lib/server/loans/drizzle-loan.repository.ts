import { and, eq, inArray, sql } from 'drizzle-orm';
import type { Loan, LoanDirection, LoanStatus } from '$lib/modules/loans/types/loan.types';
import { db, type Database } from '$lib/server/db';
import { loans, movements } from '$lib/server/db/schema';
import type { CreateLoanInput } from './inputs/create-loan.input';
import type { UpdateLoanInput } from './inputs/update-loan.input';
import type { LoanRepository } from './loan.repository';

const loanSettlementMovementTypes = ['loan_payment', 'loan_collection'] as const;

export class DrizzleLoanRepository implements LoanRepository {
	constructor(private readonly database: Database = db) {}

	async list() {
		const rows = await this.database.select().from(loans).orderBy(loans.createdAt);
		return rows.map(toLoan);
	}

	async findById(id: string) {
		const [loan] = await this.database.select().from(loans).where(eq(loans.id, id)).limit(1);
		return loan ? toLoan(loan) : undefined;
	}

	async listPaymentTotals() {
		const rows = await this.database
			.select({
				loanId: movements.loanId,
				paidAmountCents: sql<number>`coalesce(sum(${movements.amountCents}), 0)`
			})
			.from(movements)
			.where(and(
				eq(movements.active, true),
				inArray(movements.type, [...loanSettlementMovementTypes])
			))
			.groupBy(movements.loanId);

		return rows
			.filter((row): row is { loanId: string; paidAmountCents: number } => Boolean(row.loanId))
			.map((row) => ({
				loanId: row.loanId,
				paidAmountCents: Number(row.paidAmountCents)
			}));
	}

	async getPaymentTotal(loanId: string) {
		const [row] = await this.database
			.select({ paidAmountCents: sql<number>`coalesce(sum(${movements.amountCents}), 0)` })
			.from(movements)
			.where(and(
				eq(movements.active, true),
				eq(movements.loanId, loanId),
				inArray(movements.type, [...loanSettlementMovementTypes])
			));

		return Number(row?.paidAmountCents ?? 0);
	}

	async create(input: CreateLoanInput & { id: string }) {
		const now = new Date().toISOString();
		const loan = {
			id: input.id,
			name: input.name,
			direction: input.direction,
			counterpartyName: input.counterpartyName,
			principalAmountCents: input.principalAmountCents,
			totalRepaymentCents: input.totalRepaymentCents,
			installmentCount: input.installmentCount,
			firstPaymentDate: input.firstPaymentDate,
			currencyCode: input.currencyCode,
			status: 'active',
			createdAt: now,
			updatedAt: now,
			cancelledAt: null
		};

		await this.database.insert(loans).values(loan).run();
		return toLoan(loan);
	}

	async update(input: UpdateLoanInput) {
		await this.database
			.update(loans)
			.set({
				name: input.name,
				counterpartyName: input.counterpartyName,
				principalAmountCents: input.principalAmountCents,
				totalRepaymentCents: input.totalRepaymentCents,
				installmentCount: input.installmentCount,
				firstPaymentDate: input.firstPaymentDate,
				currencyCode: input.currencyCode,
				updatedAt: new Date().toISOString()
			})
			.where(eq(loans.id, input.id))
			.run();
	}

	async cancel(id: string) {
		const now = new Date().toISOString();
		await this.database
			.update(loans)
			.set({
				status: 'cancelled',
				updatedAt: now,
				cancelledAt: now
			})
			.where(eq(loans.id, id))
			.run();
	}
}

function toLoan(loan: typeof loans.$inferSelect): Loan {
	return {
		id: loan.id,
		name: loan.name,
		direction: loan.direction as LoanDirection,
		counterpartyName: loan.counterpartyName,
		principalAmountCents: loan.principalAmountCents,
		totalRepaymentCents: loan.totalRepaymentCents,
		installmentCount: loan.installmentCount,
		firstPaymentDate: loan.firstPaymentDate,
		currencyCode: loan.currencyCode,
		status: loan.status as LoanStatus,
		createdAt: loan.createdAt,
		updatedAt: loan.updatedAt,
		cancelledAt: loan.cancelledAt
	};
}

export const drizzleLoanRepository = new DrizzleLoanRepository();
