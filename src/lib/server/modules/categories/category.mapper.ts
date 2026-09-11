import type { Category, CategoryColor, CategoryNode } from '$lib/modules/categories/types/category.types';
import { normalizeCategoryColor } from '$lib/modules/categories/utils/category-color';

type CategoryRecord = {
	id: string;
	name: string;
	color: string;
	parentId: string | null;
	active: boolean;
	registeredAt: string;
	updatedAt: string | null;
	deletedAt: string | null;
};

export function toCategory(record: CategoryRecord): Category {
	return {
		...record,
		color: normalizeCategoryColor(record.color),
		updatedAt: record.updatedAt ?? record.registeredAt
	};
}

export function toCategoryTree(records: CategoryRecord[]): CategoryNode[] {
	const nodes = new Map<string, CategoryNode>();

	for (const record of records) nodes.set(record.id, { ...toCategory(record), children: [] });

	const roots: CategoryNode[] = [];
	for (const node of nodes.values()) {
		const parent = node.parentId === null ? undefined : nodes.get(node.parentId);
		if (parent) parent.children.push(node);
		else roots.push(node);
	}

	return roots;
}
