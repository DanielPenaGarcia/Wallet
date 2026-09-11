export type BankFormValues = {
	id?: string;
	name?: string;
	shortName?: string;
	countryCode?: string;
	timeZone?: string;
};

export type BankFormFeedback = {
	action: 'create-bank' | 'update-bank' | 'delete-bank';
	success?: string;
	message?: string;
	errors?: Record<string, string[]>;
	targetId?: string;
	values?: BankFormValues;
};
