import type { Bank } from '$lib/modules/banks/types/bank.types';
import type { Category, CategoryNode } from '$lib/modules/categories/types/category.types';
import type { ConfigurationFormFeedback } from '../../types/configuration-form-feedback.types';

export type SettingsTabsProps = {
	banks: Bank[];
	categories: Category[];
	categoryTree: CategoryNode[];
	feedback?: ConfigurationFormFeedback | null;
};
