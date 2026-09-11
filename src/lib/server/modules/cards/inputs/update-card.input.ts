import type { CreateCardInput } from './create-card.input';

export type UpdateCardInput = CreateCardInput & {
	id: string;
};
