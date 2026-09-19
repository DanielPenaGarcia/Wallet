export const incomeSources = ['work', 'business', 'support', 'rent', 'other'] as const;
export type IncomeSource = (typeof incomeSources)[number];

export const incomeFrequencies = ['daily', 'weekly', 'semimonthly', 'monthly'] as const;
export type IncomeFrequency = (typeof incomeFrequencies)[number];

export const workDays = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday'
] as const;
export type WorkDay = (typeof workDays)[number];

export type TimeBlock = {
	startsAt: string;
	endsAt: string;
};

export type WorkSchedule = Partial<Record<WorkDay, TimeBlock[]>>;

export type DailyPaymentSchedule = {
	type: 'daily';
};

export type WeeklyPaymentSchedule = {
	type: 'weekly';
	weekday: WorkDay;
};

export type SemimonthlyPaymentSchedule = {
	type: 'semimonthly';
	firstDay: number;
	secondDay: number | 'last';
};

export type MonthlyPaymentSchedule = {
	type: 'monthly';
	day: number | 'last';
};

export type PaymentSchedule =
	| DailyPaymentSchedule
	| WeeklyPaymentSchedule
	| SemimonthlyPaymentSchedule
	| MonthlyPaymentSchedule;

export type RecurringIncome = {
	id: string;
	title: string;
	expectedAmountCents: number;
	source: IncomeSource;
	frequency: IncomeFrequency;
	paymentSchedule: PaymentSchedule;
	workSchedule: WorkSchedule | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};
