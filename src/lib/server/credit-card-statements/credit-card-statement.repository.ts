import type { CreditCardStatement } from '$lib/modules/credit-card-statements/types/credit-card-statement.types';
import type { CreateCreditCardStatementInput } from './inputs/create-credit-card-statement.input';
import type { UpdateCreditCardStatementInput } from './inputs/update-credit-card-statement.input';

export interface CreditCardStatementRepository {
	findById(id: string): Promise<CreditCardStatement | undefined>;
	findByAccountIdAndStatementDate(accountId: string, statementDate: string): Promise<CreditCardStatement | undefined>;
	findLatestByAccountId(accountId: string): Promise<CreditCardStatement | undefined>;
	listByAccountId(accountId: string): Promise<CreditCardStatement[]>;
	create(input: CreateCreditCardStatementInput): Promise<CreditCardStatement>;
	update(input: UpdateCreditCardStatementInput): Promise<void>;
}
