import type { GoalPriority, GoalStatus, GoalType } from './financial-goal.types';

export type GoalFormValues = {
	id?: string;
	name?: string;
	targetAmount?: string;
	currentAmount?: string;
	priority?: GoalPriority;
	status?: GoalStatus;
	type?: GoalType;
	distributionPercentage?: string;
	currencyCode?: string;
};

export type GoalFormFeedback = {
	action: 'create-goal' | 'update-goal' | 'delete-goal';
	success?: string;
	message?: string;
	errors?: Record<string, string[]>;
	targetId?: string;
	values?: GoalFormValues;
};
