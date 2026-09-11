export type IncomeFormFeedback = {
	action: 'create-income' | 'update-income' | 'delete-income';
	success?: string;
	message?: string;
	errors?: Record<string, string[]>;
	targetId?: string;
	values?: {
		jobName?: string;
		monthlyAmount?: string;
		amountType?: 'gross' | 'net';
		paymentFrequency?: 'weekly' | 'semimonthly' | 'monthly';
		hasSchedule?: boolean;
		schedule?: string;
		currencyCode?: string;
	};
};
