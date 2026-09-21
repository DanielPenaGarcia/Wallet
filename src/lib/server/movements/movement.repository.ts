import type { CreateMovementInput } from './inputs/create-movement.input';
import type { AccountBalanceChangeInput } from './inputs/account-balance-change.input';
import type { ListMovementsInput } from './inputs/list-movements.input';
import type { RecurringMaterializationInput } from './inputs/recurring-materialization.input';
import type { UpdateMovementInput } from './inputs/update-movement.input';
import type { MovementOutput } from './outputs/movement.output';

export interface MovementRepository {
	findById(id: string): Promise<MovementOutput | undefined>;
	findActiveRecurringMaterialization(input: RecurringMaterializationInput): Promise<MovementOutput | undefined>;
	list(input?: ListMovementsInput): Promise<MovementOutput[]>;
	createWithBalanceChanges(
		input: CreateMovementInput,
		balanceChanges: AccountBalanceChangeInput[]
	): Promise<MovementOutput>;
	updateWithBalanceChanges(
		input: UpdateMovementInput,
		balanceChanges: AccountBalanceChangeInput[]
	): Promise<MovementOutput>;
	softDeleteWithBalanceChanges(
		id: string,
		balanceChanges: AccountBalanceChangeInput[]
	): Promise<void>;
}
