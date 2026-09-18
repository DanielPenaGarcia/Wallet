import type { CreateCategoryInput } from './create-category.input';

export type UpdateCategoryInput = Omit<CreateCategoryInput, 'parentId'> & {
	id: string;
};
