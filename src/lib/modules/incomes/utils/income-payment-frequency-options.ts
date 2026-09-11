import type { IncomePaymentFrequency } from '../types/job-income.types';

const shortFrequencyLabels: Record<IncomePaymentFrequency, string> = {
	weekly: 'Semanal',
	semimonthly: 'Quincenal',
	monthly: 'Mensual'
};

const cadenceFrequencyLabels: Record<IncomePaymentFrequency, string> = {
	weekly: 'Pago semanal',
	semimonthly: 'Pago quincenal',
	monthly: 'Pago mensual'
};

export const incomePaymentFrequencyOptions = Object.entries(shortFrequencyLabels).map(
	([value, label]) => ({ value: value as IncomePaymentFrequency, label })
);

export function getIncomePaymentFrequencyLabel(frequency: IncomePaymentFrequency) {
	return shortFrequencyLabels[frequency];
}

export function getIncomePaymentCadenceLabel(frequency: IncomePaymentFrequency) {
	return cadenceFrequencyLabels[frequency];
}
