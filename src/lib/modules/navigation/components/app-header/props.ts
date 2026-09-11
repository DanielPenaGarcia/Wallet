import type { NextIncomePayment } from '$lib/modules/incomes/types/next-income-payment.types';

export type AppHeaderProps = {
	currentPath: string;
	nextIncomePayment: NextIncomePayment | null;
	onOpenSidebar: () => void;
};
