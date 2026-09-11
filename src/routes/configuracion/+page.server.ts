import { fail } from '@sveltejs/kit';
import { createBankSchema } from '$lib/modules/banks/schemas/create-bank.schema';
import { deleteBankSchema } from '$lib/modules/banks/schemas/delete-bank.schema';
import { updateBankSchema } from '$lib/modules/banks/schemas/update-bank.schema';
import { createCategorySchema } from '$lib/modules/categories/schemas/create-category.schema';
import { deleteCategorySchema } from '$lib/modules/categories/schemas/delete-category.schema';
import { updateCategorySchema } from '$lib/modules/categories/schemas/update-category.schema';
import { formStringValue } from '$lib/shared/utils/form-data';
import { BankHasCardsError, BankNameAlreadyExistsError, BankNotFoundError } from '$lib/server/modules/banks/bank.errors';
import { createBank, deleteBank, getBanks, updateBank } from '$lib/server/modules/banks/bank.service';
import {
	CategoryHasActiveChildrenError,
	CategoryNameAlreadyExistsError,
	CategoryNotFoundError,
	ParentCategoryNotFoundError
} from '$lib/server/modules/categories/category.errors';
import {
	createCategory,
	deleteCategory,
	getCategoryOptions,
	getCategoryTree,
	updateCategory
} from '$lib/server/modules/categories/category.service';

export async function load() {
	const [categories, categoryTree, banks] = await Promise.all([
		getCategoryOptions(),
		getCategoryTree(),
		getBanks()
	]);
	return { categories, categoryTree, banks };
}

function bankFormValues(entries: Record<string, FormDataEntryValue>) {
	return {
		id: formStringValue(entries.id),
		name: formStringValue(entries.name),
		shortName: formStringValue(entries.shortName),
		countryCode: formStringValue(entries.countryCode),
		timeZone: formStringValue(entries.timeZone)
	};
}

export const actions = {
	createBank: async ({ request }) => {
		const entries = Object.fromEntries(await request.formData());
		const result = createBankSchema.safeParse(entries);
		if (!result.success) {
			return fail(400, {
				action: 'create-bank' as const,
				errors: result.error.flatten().fieldErrors,
				values: bankFormValues(entries)
			});
		}
		try {
			await createBank(result.data);
			return { action: 'create-bank' as const, success: 'Banco registrado correctamente.' };
		} catch (error) {
			if (error instanceof BankNameAlreadyExistsError) {
				return fail(400, {
					action: 'create-bank' as const,
					message: error.message,
					values: bankFormValues(entries)
				});
			}
			throw error;
		}
	},
	updateBank: async ({ request }) => {
		const entries = Object.fromEntries(await request.formData());
		const result = updateBankSchema.safeParse(entries);
		const targetId = formStringValue(entries.id);
		if (!result.success) {
			return fail(400, {
				action: 'update-bank' as const,
				targetId,
				errors: result.error.flatten().fieldErrors,
				values: bankFormValues(entries)
			});
		}
		try {
			await updateBank(result.data);
			return { action: 'update-bank' as const, success: 'Banco actualizado correctamente.' };
		} catch (error) {
			if (error instanceof BankNotFoundError || error instanceof BankNameAlreadyExistsError) {
				return fail(400, {
					action: 'update-bank' as const,
					targetId,
					message: error.message,
					values: bankFormValues(entries)
				});
			}
			throw error;
		}
	},
	deleteBank: async ({ request }) => {
		const result = deleteBankSchema.safeParse(Object.fromEntries(await request.formData()));
		if (!result.success) return fail(400, { action: 'delete-bank' as const, message: 'Banco inválido.' });
		try {
			await deleteBank(result.data.id);
			return { action: 'delete-bank' as const, success: 'Banco eliminado correctamente.' };
		} catch (error) {
			if (error instanceof BankNotFoundError || error instanceof BankHasCardsError) {
				return fail(400, {
					action: 'delete-bank' as const,
					targetId: result.data.id,
					message: error.message
				});
			}
			throw error;
		}
	},
	createCategory: async ({ request }) => {
		const rawValues = Object.fromEntries(await request.formData());
		const result = createCategorySchema.safeParse(rawValues);
		if (!result.success) {
			return fail(400, {
				action: 'create-category' as const,
				errors: result.error.flatten().fieldErrors,
				values: {
					name: typeof rawValues.name === 'string' ? rawValues.name : '',
					color: typeof rawValues.color === 'string' ? rawValues.color : '#16a34a',
					parentId: typeof rawValues.parentId === 'string' && rawValues.parentId ? rawValues.parentId : null
				}
			});
		}

		try {
			await createCategory(result.data);
			return { action: 'create-category' as const, success: 'Categoría registrada correctamente.' };
		} catch (error) {
			if (
				error instanceof ParentCategoryNotFoundError ||
				error instanceof CategoryNameAlreadyExistsError
			) {
				return fail(400, { action: 'create-category' as const, message: error.message, values: result.data });
			}
			throw error;
		}
	},
	updateCategory: async ({ request }) => {
		const result = updateCategorySchema.safeParse(Object.fromEntries(await request.formData()));
		if (!result.success) {
			return fail(400, {
				action: 'update-category' as const,
				errors: result.error.flatten().fieldErrors
			});
		}

		try {
			await updateCategory(result.data);
			return { action: 'update-category' as const, success: 'Categoría actualizada correctamente.' };
		} catch (error) {
			if (error instanceof CategoryNotFoundError || error instanceof CategoryNameAlreadyExistsError) {
				return fail(400, {
					action: 'update-category' as const,
					message: error.message,
					values: { ...result.data, parentId: null }
				});
			}
			throw error;
		}
	},
	deleteCategory: async ({ request }) => {
		const result = deleteCategorySchema.safeParse(Object.fromEntries(await request.formData()));
		if (!result.success) return fail(400, { action: 'delete-category' as const, message: 'Categoría inválida.' });

		try {
			await deleteCategory(result.data.id);
			return { action: 'delete-category' as const, success: 'Categoría eliminada correctamente.' };
		} catch (error) {
			if (error instanceof CategoryNotFoundError || error instanceof CategoryHasActiveChildrenError) {
				return fail(400, {
					action: 'delete-category' as const,
					message: error.message,
					values: { id: result.data.id, name: '', color: '#64748b', parentId: null }
				});
			}
			throw error;
		}
	}
};
