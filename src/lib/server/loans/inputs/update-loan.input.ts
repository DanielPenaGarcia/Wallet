import type { CreateLoanInput } from './create-loan.input';

export type UpdateLoanInput = Omit<CreateLoanInput, 'direction' | 'accountId' | 'occurredAt'> & {
	id: string;
};
