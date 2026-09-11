import type { Category, CategoryNode } from '../../types/category.types';

export type CategoryTreeItemProps = {
	category: CategoryNode;
	depth?: number;
	expandedIds: string[];
	searching?: boolean;
	onToggleExpanded: (categoryId: string) => void;
	onAddChild: (category: Category) => void;
	onEdit: (category: Category) => void;
	onDelete: (category: Category) => void;
};
