import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';

export type CardSelectFieldProps = {
	id: string;
	name: string;
	label: string;
	cards: CardListItem[];
	value: string;
	error?: string;
	placeholder?: string;
	required?: boolean;
	emptyLabel?: string;
	class?: string;
};
