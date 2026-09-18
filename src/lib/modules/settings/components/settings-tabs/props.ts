import type { Bank } from '$lib/modules/banks/types/bank.types';
import type { BankFormFeedback } from '$lib/modules/banks/types/bank-form-feedback.types';
import type { Category, CategoryNode } from '$lib/modules/categories/types/category.types';
import type { CategoryFormFeedback } from '$lib/modules/categories/types/category-form-feedback.types';
import type { ColorPalette } from '$lib/modules/color-palettes/types/color-palette.types';

export type SettingsTabsProps = {
	banks: Bank[];
	categories: Category[];
	categoryTree: CategoryNode[];
	colorPalettes: ColorPalette[];
	selectedColorPaletteId: string | null;
	feedback?: BankFormFeedback | CategoryFormFeedback | null;
};
