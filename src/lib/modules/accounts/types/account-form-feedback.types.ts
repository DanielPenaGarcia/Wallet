export type AccountFormValues = {
	id?: string;
	name?: string;
	bankId?: string;
	initialBalance?: string;
	newBalance?: string;
	reason?: string;
};

export type AccountFormFeedback = {
	action: 'create-account' | 'update-account' | 'delete-account' | 'adjust-account-balance';
	success?: string;
	message?: string;
	errors?: Record<string, string[]>;
	targetId?: string;
	values?: AccountFormValues;
};
