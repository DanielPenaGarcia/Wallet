import type { Bank } from '$lib/modules/banks/types/bank.types';
import type { BankFormFeedback } from '$lib/modules/banks/types/bank-form-feedback.types';
import type { Category, CategoryNode } from '$lib/modules/categories/types/category.types';
import type { CategoryFormFeedback } from '$lib/modules/categories/types/category-form-feedback.types';

export type SettingsTabsProps = {
	banks: Bank[];
	categories: Category[];
	categoryTree: CategoryNode[];
	feedback?: BankFormFeedback | CategoryFormFeedback | null;
};
