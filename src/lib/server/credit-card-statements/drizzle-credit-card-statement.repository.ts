import { and, desc, eq } from 'drizzle-orm';
import type { CreditCardStatement } from '$lib/modules/credit-card-statements/types/credit-card-statement.types';
import { db, type Database } from '$lib/server/db';
import { creditCardStatements } from '$lib/server/db/schema';
import type { CreditCardStatementRepository } from './credit-card-statement.repository';
import type { CreateCreditCardStatementInput } from './inputs/create-credit-card-statement.input';
import type { UpdateCreditCardStatementInput } from './inputs/update-credit-card-statement.input';

class DrizzleCreditCardStatementRepository implements CreditCardStatementRepository {
	constructor(private readonly database: Database = db) {}

	async findById(id: string) {
		const [statement] = await this.database
			.select()
			.from(creditCardStatements)
			.where(eq(creditCardStatements.id, id))
			.limit(1);

		return statement ? this.toCreditCardStatement(statement) : undefined;
	}

	async findByAccountIdAndStatementDate(accountId: string, statementDate: string) {
		const [statement] = await this.database
			.select()
			.from(creditCardStatements)
			.where(and(
				eq(creditCardStatements.accountId, accountId),
				eq(creditCardStatements.statementDate, statementDate)
			))
			.limit(1);

		return statement ? this.toCreditCardStatement(statement) : undefined;
	}

	async findLatestByAccountId(accountId: string) {
		const [statement] = await this.database
			.select()
			.from(creditCardStatements)
			.where(eq(creditCardStatements.accountId, accountId))
			.orderBy(desc(creditCardStatements.statementDate))
			.limit(1);

		return statement ? this.toCreditCardStatement(statement) : undefined;
	}

	async listByAccountId(accountId: string) {
		const statements = await this.database
			.select()
			.from(creditCardStatements)
			.where(eq(creditCardStatements.accountId, accountId))
			.orderBy(desc(creditCardStatements.statementDate));

		return statements.map((statement) => this.toCreditCardStatement(statement));
	}

	async create(input: CreateCreditCardStatementInput) {
		const now = new Date().toISOString();
		const statement = {
			id: crypto.randomUUID(),
			accountId: input.accountId,
			periodStartDate: input.periodStartDate,
			periodEndDate: input.periodEndDate,
			statementDate: input.statementDate,
			paymentDueDate: input.paymentDueDate,
			statementBalanceCents: input.statementBalanceCents,
			paidAmountCents: input.paidAmountCents,
			createdAt: now,
			updatedAt: now
		};

		await this.database.insert(creditCardStatements).values(statement);
		return this.toCreditCardStatement(statement);
	}

	async update(input: UpdateCreditCardStatementInput): Promise<void> {
		await this.database
			.update(creditCardStatements)
			.set({
				accountId: input.accountId,
				periodStartDate: input.periodStartDate,
				periodEndDate: input.periodEndDate,
				statementDate: input.statementDate,
				paymentDueDate: input.paymentDueDate,
				statementBalanceCents: input.statementBalanceCents,
				paidAmountCents: input.paidAmountCents,
				updatedAt: new Date().toISOString()
			})
			.where(eq(creditCardStatements.id, input.id));
	}

	private toCreditCardStatement(statement: typeof creditCardStatements.$inferSelect): CreditCardStatement {
		return {
			id: statement.id,
			accountId: statement.accountId,
			periodStartDate: statement.periodStartDate,
			periodEndDate: statement.periodEndDate,
			statementDate: statement.statementDate,
			paymentDueDate: statement.paymentDueDate,
			statementBalanceCents: statement.statementBalanceCents,
			paidAmountCents: statement.paidAmountCents,
			createdAt: statement.createdAt,
			updatedAt: statement.updatedAt
		};
	}
}

export const drizzleCreditCardStatementRepository = new DrizzleCreditCardStatementRepository();
