import type { Category } from '../../types/category.types';
import type { CategoryFormFeedback } from '../../types/category-form-feedback.types';

export type DeleteCategoryFormProps = {
	category: Category;
	feedback?: CategoryFormFeedback | null;
	onCancel: () => void;
};
