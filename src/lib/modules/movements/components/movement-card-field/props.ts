import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';

export type MovementCardFieldProps = {
	id: string;
	name: 'sourceCardId' | 'destinationCardId';
	label: string;
	cards: CardListItem[];
	value: string;
	error?: string;
};
