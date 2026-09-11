import type {
	ExpenseAmountKind,
	ExpenseClassification,
	ExpenseFrequency,
	ExpenseIntervalUnit
} from '../types/expense.types';
import {
	expenseAmountKinds,
	expenseClassifications,
	expenseFrequencies,
	expenseIntervalUnits
} from '../types/expense.types';

const classificationLabels: Record<ExpenseClassification, string> = {
	necessity: 'Necesidad',
	discretionary: 'Discrecional',
	gifts_social: 'Regalos/Social',
	obligations: 'Obligaciones',
	savings_investment: 'Ahorro/Inversión',
	extraordinary: 'Extraordinario'
};

const frequencyLabels: Record<ExpenseFrequency, string> = {
	one_time: 'Una vez',
	daily: 'Diario',
	weekly: 'Semanal',
	semimonthly: 'Quincenal',
	monthly: 'Mensual',
	yearly: 'Anual',
	custom: 'Personalizado'
};

const amountKindLabels: Record<ExpenseAmountKind, string> = {
	fixed: 'Fijo',
	estimated: 'Aproximado'
};

const intervalUnitLabels: Record<ExpenseIntervalUnit, { singular: string; plural: string }> = {
	days: { singular: 'día', plural: 'días' },
	weeks: { singular: 'semana', plural: 'semanas' },
	months: { singular: 'mes', plural: 'meses' },
	years: { singular: 'año', plural: 'años' }
};

export const expenseClassificationOptions = expenseClassifications.map((value) => ({
	value,
	label: classificationLabels[value]
}));

export const expenseFrequencyOptions = expenseFrequencies.map((value) => ({
	value,
	label: frequencyLabels[value]
}));

export const expenseAmountKindOptions = expenseAmountKinds.map((value) => ({
	value,
	label: amountKindLabels[value]
}));

export const expenseIntervalUnitOptions = expenseIntervalUnits.map((value) => ({
	value,
	label: intervalUnitLabels[value].plural
}));

export function getExpenseFrequencyLabel(
	frequency: ExpenseFrequency,
	customIntervalCount: number | null,
	customIntervalUnit: ExpenseIntervalUnit | null
): string {
	if (frequency !== 'custom' || customIntervalCount === null || customIntervalUnit === null) {
		return frequencyLabels[frequency];
	}

	const unit = intervalUnitLabels[customIntervalUnit];
	return `Cada ${customIntervalCount} ${customIntervalCount === 1 ? unit.singular : unit.plural}`;
}
