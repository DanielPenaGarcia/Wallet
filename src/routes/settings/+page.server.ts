import { fail, type Actions } from '@sveltejs/kit';
import { colorInputToHex } from '$lib/shared/utils/color';
import { BankNameAlreadyExistsError, BankNotFoundError } from '$lib/server/modules/banks/bank.errors';
import { createBank, deleteBank, getBanks, updateBank } from '$lib/server/modules/banks/bank.service';

export async function load() {
	return {
		banks: await getBanks()
	};
}

function formValue(formData: FormData, field: string) {
	const value = formData.get(field);
	return typeof value === 'string' ? value : '';
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
			name,
			alias,
			color: color ?? values.color.trim()
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
			await createBank(input);
			return { action: 'create-bank' as const, success: 'Banco registrado.' };
		} catch (error) {
			if (error instanceof BankNameAlreadyExistsError) {
				return fail(400, { action: 'create-bank' as const, message: error.message, values });
			}
			throw error;
		}
	},
	updateBank: async ({ request }) => {
		const values = bankValues(await request.formData());
		const { errors, input } = validateBankValues(values);
		if (values.id.trim().length === 0) errors.id = ['El banco es obligatorio.'];
		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'update-bank' as const, targetId: values.id, errors, values });
		}

		try {
			await updateBank({ id: values.id, ...input });
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
			await deleteBank(id);
			return { action: 'delete-bank' as const, success: 'Banco eliminado.' };
		} catch (error) {
			if (error instanceof BankNotFoundError) {
				return fail(400, { action: 'delete-bank' as const, targetId: id, message: error.message });
			}
			throw error;
		}
	}
};
