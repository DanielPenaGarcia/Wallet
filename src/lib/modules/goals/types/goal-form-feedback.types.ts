export type GoalFormValues = {
	name?: string;
	targetAmount?: string;
	allocationPercentage?: string;
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
