import type { Bank } from '$lib/modules/banks/types/bank.types';
import type { CreateBankInput } from './inputs/create-bank.input';
import type { UpdateBankInput } from './inputs/update-bank.input';

export interface BankRepository {
	findById(id: string): Promise<Bank | undefined>;
	list(): Promise<Bank[]>;
	create(input: CreateBankInput): Promise<Bank>;
	update(input: UpdateBankInput): Promise<void>;
	delete(id: string): Promise<void>;
}
