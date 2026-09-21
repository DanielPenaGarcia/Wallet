import type { CreateMovementInput } from './create-movement.input';

export type UpdateMovementInput = CreateMovementInput & {
	id: string;
};
