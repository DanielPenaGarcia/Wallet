import { fail, type Actions } from '@sveltejs/kit';
import {
	BankNameAlreadyExistsError,
	BankNotFoundError
} from '$lib/server/banks/bank.errors';
import { bankService } from '$lib/server/banks/bank.service';
import {
	CategoryNameAlreadyExistsError,
	CategoryNotFoundError,
	ParentCategoryNotFoundError
} from '$lib/server/categories/category.errors';
import { categoryService } from '$lib/server/categories/category.service';
import { colorPaletteService } from '$lib/server/color-palettes/color-palette.service';
import { colorInputToHex } from '$lib/shared/utils/color';

export async function load() {
	const [banks, categories, colorPalettes, selectedColorPalette] = await Promise.all([
		bankService.getBanks(),
		categoryService.getCategories(),
		colorPaletteService.getColorPalettes(),
		colorPaletteService.getDefaultColorPalette()
	]);

	return {
		banks,
		categories,
		categoryTree: categoryService.buildCategoryTree(categories),
		colorPalettes,
		selectedColorPaletteId: selectedColorPalette?.id ?? null
	};
}

function formValue(formData: FormData, field: string) {
	const value = formData.get(field);
	return typeof value === 'string' ? value : '';
}

function formBoolean(formData: FormData, field: string) {
	return formData.get(field) === 'true';
}

function bankValues(formData: FormData) {
	return {
		id: formValue(formData, 'id'),
		name: formValue(formData, 'name'),
		alias: formValue(formData, 'alias'),
		color: formValue(formData, 'color')
	};
}

function validateBankValues(values: ReturnType<typeof bankValues>) {
	const errors: Record<string, string[]> = {};
	const name = values.name.trim();
	const alias = values.alias.trim();
	const color = colorInputToHex(values.color);

	if (name.length === 0) errors.name = ['El nombre es obligatorio.'];
	if (name.length > 100) errors.name = ['El nombre debe tener máximo 100 caracteres.'];
	if (alias.length === 0) errors.alias = ['El alias es obligatorio.'];
	if (alias.length > 40) errors.alias = ['El alias debe tener máximo 40 caracteres.'];
	if (!color) errors.color = ['El color debe ser hexadecimal o rgb válido.'];

	return {
		errors,
		input: {
			name: values.name,
			alias: values.alias,
			color: values.color
		}
	};
}

function categoryValues(formData: FormData) {
	return {
		id: formValue(formData, 'id'),
		name: formValue(formData, 'name'),
		color: formValue(formData, 'color') || null,
		parentId: formValue(formData, 'parentId') || null,
		isEssential: formBoolean(formData, 'isEssential')
	};
}

function validateCategoryValues(
	values: ReturnType<typeof categoryValues>,
	options: { requireColor: boolean }
) {
	const errors: Record<string, string[]> = {};
	const name = values.name.trim();
	const color = values.color ? colorInputToHex(values.color) : null;

	if (name.length === 0) errors.name = ['El nombre es obligatorio.'];
	if (name.length > 60) errors.name = ['El nombre debe tener máximo 60 caracteres.'];
	if (options.requireColor && !color) errors.color = ['El color debe ser hexadecimal o rgb válido.'];
	if (!options.requireColor && values.color && !color) {
		errors.color = ['El color debe ser hexadecimal o rgb válido.'];
	}

	return {
		errors,
		input: {
			name: values.name,
			color: values.color,
			parentId: values.parentId,
			isEssential: values.isEssential
		}
	};
}

export const actions: Actions = {
	createBank: async ({ request }) => {
		const values = bankValues(await request.formData());
		const { errors, input } = validateBankValues(values);
		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'create-bank' as const, errors, values });
		}

		try {
			await bankService.createBank(input);
			return { action: 'create-bank' as const, success: 'Banco registrado.' };
		} catch (error) {
			if (error instanceof BankNameAlreadyExistsError) {
				return fail(400, {
					action: 'create-bank' as const,
					message: error.message,
					values
				});
			}
			throw error;
		}
	},
	updateBank: async ({ request }) => {
		const values = bankValues(await request.formData());
		const { errors, input } = validateBankValues(values);
		if (values.id.trim().length === 0) errors.id = ['El banco es obligatorio.'];
		if (Object.keys(errors).length > 0) {
			return fail(400, {
				action: 'update-bank' as const,
				targetId: values.id,
				errors,
				values
			});
		}

		try {
			await bankService.updateBank({ id: values.id, ...input });
			return { action: 'update-bank' as const, success: 'Banco actualizado.' };
		} catch (error) {
			if (error instanceof BankNameAlreadyExistsError || error instanceof BankNotFoundError) {
				return fail(400, {
					action: 'update-bank' as const,
					targetId: values.id,
					message: error.message,
					values
				});
			}
			throw error;
		}
	},
	deleteBank: async ({ request }) => {
		const formData = await request.formData();
		const id = formValue(formData, 'id').trim();
		if (id.length === 0) {
			return fail(400, {
				action: 'delete-bank' as const,
				targetId: id,
				message: 'El banco es obligatorio.'
			});
		}

		try {
			await bankService.deleteBank(id);
			return { action: 'delete-bank' as const, success: 'Banco eliminado.' };
		} catch (error) {
			if (error instanceof BankNotFoundError) {
				return fail(400, { action: 'delete-bank' as const, targetId: id, message: error.message });
			}
			throw error;
		}
	},
	createCategory: async ({ request }) => {
		const values = categoryValues(await request.formData());
		const { errors, input } = validateCategoryValues(values, { requireColor: values.parentId === null });
		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'create-category' as const, errors, values });
		}

		try {
			await categoryService.createCategory(input);
			return { action: 'create-category' as const, success: 'Categoría registrada.' };
		} catch (error) {
			if (
				error instanceof CategoryNameAlreadyExistsError ||
				error instanceof ParentCategoryNotFoundError
			) {
				return fail(400, { action: 'create-category' as const, message: error.message, values });
			}
			throw error;
		}
	},
	updateCategory: async ({ request }) => {
		const values = categoryValues(await request.formData());
		const { errors, input } = validateCategoryValues(values, { requireColor: false });
		if (values.id.trim().length === 0) errors.id = ['La categoría es obligatoria.'];
		if (Object.keys(errors).length > 0) {
			return fail(400, {
				action: 'update-category' as const,
				targetId: values.id,
				errors,
				values
			});
		}

		try {
			await categoryService.updateCategory({ id: values.id, ...input });
			return { action: 'update-category' as const, success: 'Categoría actualizada.' };
		} catch (error) {
			if (error instanceof CategoryNameAlreadyExistsError || error instanceof CategoryNotFoundError) {
				return fail(400, {
					action: 'update-category' as const,
					targetId: values.id,
					message: error.message,
					values
				});
			}
			throw error;
		}
	},
	deleteCategory: async ({ request }) => {
		const formData = await request.formData();
		const id = formValue(formData, 'id').trim();
		const values = { id, name: '', color: null, parentId: null, isEssential: false };
		if (id.length === 0) {
			return fail(400, {
				action: 'delete-category' as const,
				targetId: id,
				message: 'La categoría es obligatoria.',
				values
			});
		}

		try {
			await categoryService.deleteCategory(id);
			return { action: 'delete-category' as const, success: 'Categoría eliminada.' };
		} catch (error) {
			if (error instanceof CategoryNotFoundError) {
				return fail(400, {
					action: 'delete-category' as const,
					targetId: id,
					message: error.message,
					values
				});
			}
			throw error;
		}
	}
};
