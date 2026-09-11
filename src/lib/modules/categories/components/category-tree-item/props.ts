import type { Category, CategoryNode } from '../../types/category.types';

export type CategoryTreeItemProps = {
	category: CategoryNode;
	depth?: number;
	onAddChild: (category: Category) => void;
	onEdit: (category: Category) => void;
	onDelete: (category: Category) => void;
};
