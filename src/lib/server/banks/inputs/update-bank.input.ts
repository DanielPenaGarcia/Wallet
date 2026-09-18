import type { CreateBankInput } from './create-bank.input';

export type UpdateBankInput = CreateBankInput & {
	id: string;
};
