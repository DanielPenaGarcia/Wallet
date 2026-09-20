import type { Account } from '$lib/modules/accounts/types/account.types';
import type { AdjustAccountBalanceInput } from './inputs/adjust-account-balance.input';
import type { CreateAccountInput } from './inputs/create-account.input';
import type { UpdateAccountInput } from './inputs/update-account.input';

export interface AccountRepository {
	findById(id: string): Promise<Account | undefined>;
	findPersonal(): Promise<Account | undefined>;
	list(): Promise<Account[]>;
	createPersonal(): Promise<Account>;
	createDebit(input: CreateAccountInput): Promise<Account>;
	update(input: UpdateAccountInput): Promise<void>;
	delete(id: string): Promise<void>;
	adjustBalance(input: AdjustAccountBalanceInput): Promise<void>;
}
