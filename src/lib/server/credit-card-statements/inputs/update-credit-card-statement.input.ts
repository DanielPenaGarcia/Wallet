import type { CreateCreditCardStatementInput } from './create-credit-card-statement.input';

export type UpdateCreditCardStatementInput = CreateCreditCardStatementInput & {
	id: string;
};
