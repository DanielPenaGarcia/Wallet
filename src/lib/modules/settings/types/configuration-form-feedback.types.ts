import type { BankFormFeedback } from '$lib/modules/banks/types/bank-form-feedback.types';
import type { CategoryFormFeedback } from '$lib/modules/categories/types/category-form-feedback.types';

export type ConfigurationFormFeedback = BankFormFeedback | CategoryFormFeedback;
