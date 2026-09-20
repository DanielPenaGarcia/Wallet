import { formatCurrencyFromMinorUnits } from '$lib/shared/utils/format-currency';
import { formatIsoDate } from '$lib/shared/utils/format-iso-date';
import type { FinancialGoal, GoalPriority, GoalStatus, GoalType } from '../types/financial-goal.types';
import { goalPriorities, goalStatuses, goalTypes } from '../types/financial-goal.types';

const goalTypeLabels: Record<GoalType, string> = {
	purchase: 'Compra',
	emergency_fund: 'Fondo de emergencia',
	travel: 'Viaje',
	savings: 'Ahorro',
	other: 'Otro'
};

const goalPriorityLabels: Record<GoalPriority, string> = {
	high: 'Alta',
	medium: 'Media',
	low: 'Baja'
};

const goalStatusLabels: Record<GoalStatus, string> = {
	active: 'Activa',
	paused: 'Pausada',
	completed: 'Completada',
	cancelled: 'Cancelada'
};

export const goalTypeOptions = goalTypes.map((value) => ({ value, label: goalTypeLabels[value] }));
export const goalPriorityOptions = goalPriorities.map((value) => ({ value, label: goalPriorityLabels[value] }));
export const goalStatusOptions = goalStatuses.map((value) => ({ value, label: goalStatusLabels[value] }));

export function getGoalTypeLabel(type: GoalType) {
	return goalTypeLabels[type];
}

export function getGoalPriorityLabel(priority: GoalPriority) {
	return goalPriorityLabels[priority];
}

export function getGoalStatusLabel(status: GoalStatus) {
	return goalStatusLabels[status];
}

export function goalProgressPercentage(goal: Pick<FinancialGoal, 'currentAmountCents' | 'targetAmountCents'>) {
	if (goal.targetAmountCents <= 0) return 0;
	return Math.min(100, Math.round((goal.currentAmountCents / goal.targetAmountCents) * 100));
}

export function remainingGoalAmount(goal: Pick<FinancialGoal, 'currentAmountCents' | 'targetAmountCents'>) {
	return Math.max(0, goal.targetAmountCents - goal.currentAmountCents);
}

export function formatGoalAmount(amountCents: number, currencyCode = 'MXN') {
	return formatCurrencyFromMinorUnits(amountCents, currencyCode);
}

export function formatEstimatedCompletionDate(value: string | null) {
	return formatIsoDate(value);
}

export function formatEstimatedPeriods(periods: number | null) {
	if (periods === null) return 'No disponible';
	if (periods === 0) return 'Completada';
	return `${periods} ${periods === 1 ? 'periodo' : 'periodos'}`;
}
