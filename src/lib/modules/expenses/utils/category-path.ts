import type { Category } from '$lib/modules/categories/types/category.types';

export function getCategoryPath(category: Category | undefined, categories: Category[]): string {
	if (!category) return 'Selecciona una categoría';
	const names = [category.name];
	let parentId = category.parentId;
	const visited = new Set([category.id]);

	while (parentId !== null && !visited.has(parentId)) {
		const parent = categories.find((item) => item.id === parentId);
		if (!parent) break;
		names.unshift(parent.name);
		visited.add(parent.id);
		parentId = parent.parentId;
	}

	return names.join(' › ');
}
