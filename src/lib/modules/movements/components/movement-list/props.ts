import type { CardListItem } from '$lib/modules/cards/types/card-list-item.types';
import type { Category } from '$lib/modules/categories/types/category.types';
import type { Movement } from '../../types/movement.types';

export type MovementListProps = {
	movements: Movement[];
	cards: CardListItem[];
	categories: Category[];
	filters: {
		startDate: string;
		endDate: string;
		cardId: string;
		categoryId: string;
	};
	onCreate: () => void;
	onBulkCreate: () => void;
	onExport: () => void;
	onEdit: (movement: Movement) => void;
	onDelete: (movement: Movement) => void;
};
