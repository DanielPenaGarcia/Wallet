import type { Category } from '../../types/category.types';
import type { CategoryFormFeedback } from '../../types/category-form-feedback.types';

export type CreateCategoryFormProps = {
	parent: Category | null;
	feedback?: CategoryFormFeedback | null;
	onCancel: () => void;
};
