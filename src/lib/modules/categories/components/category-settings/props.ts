import type { Category, CategoryNode } from '../../types/category.types';
import type { CategoryFormFeedback } from '../../types/category-form-feedback.types';

export type CategorySettingsProps = {
	categories: Category[];
	categoryTree: CategoryNode[];
	feedback?: CategoryFormFeedback | null;
};
