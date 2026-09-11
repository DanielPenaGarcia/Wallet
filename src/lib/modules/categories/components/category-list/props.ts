import type { Category, CategoryNode } from '../../types/category.types';

export type CategoryListProps = {
	categories: CategoryNode[];
	onCreateRoot: () => void;
	onAddChild: (category: Category) => void;
	onEdit: (category: Category) => void;
	onDelete: (category: Category) => void;
};
