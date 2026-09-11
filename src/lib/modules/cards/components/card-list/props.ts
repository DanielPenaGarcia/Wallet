import type { CardListItem } from '../../types/card-list-item.types';

export type CardListProps = {
	cards: CardListItem[];
	onViewDetails?: (card: CardListItem) => void;
	onEdit?: (card: CardListItem) => void;
	onDelete?: (card: CardListItem) => void;
};
