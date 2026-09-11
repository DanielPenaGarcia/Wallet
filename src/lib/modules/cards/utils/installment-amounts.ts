import type { MoneyInMinorUnits } from '../types/card.types';

export function splitAmountIntoInstallments(
	amount: MoneyInMinorUnits,
	installmentCount: number
): MoneyInMinorUnits[] {
	const count = Math.max(installmentCount, 1);
	const baseAmount = Math.floor(amount / count);
	const remainder = amount % count;

	return Array.from({ length: count }, (_, index) =>
		index < remainder ? baseAmount + 1 : baseAmount
	);
}
