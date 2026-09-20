import type {
	InstallmentPurchase,
	InstallmentPurchaseAmounts,
	InstallmentPurchaseCounts,
	InstallmentPurchaseSummary
} from '../types/installment-purchase.types';

type InstallmentPurchaseInput = Pick<
	InstallmentPurchase,
	| 'originalAmountCents'
	| 'installmentAmountCents'
	| 'totalInstallments'
	| 'billedInstallments'
	| 'paidInstallments'
>;

export function getInstallmentAmount(purchase: InstallmentPurchaseInput, installmentNumber: number) {
	if (!Number.isInteger(installmentNumber) || installmentNumber < 1 || installmentNumber > purchase.totalInstallments) return 0;
	if (installmentNumber === purchase.totalInstallments) {
		return Math.max(0, purchase.originalAmountCents - purchase.installmentAmountCents * (purchase.totalInstallments - 1));
	}

	return purchase.installmentAmountCents;
}

export function sumInstallmentRange(purchase: InstallmentPurchaseInput, from: number, to: number) {
	let total = 0;
	for (let installmentNumber = from; installmentNumber <= to; installmentNumber += 1) {
		total += getInstallmentAmount(purchase, installmentNumber);
	}
	return total;
}

export function getInstallmentCounts(purchase: InstallmentPurchaseInput): InstallmentPurchaseCounts {
	const unpaidBilledInstallments = Math.max(0, purchase.billedInstallments - purchase.paidInstallments);
	const futureInstallments = Math.max(0, purchase.totalInstallments - purchase.billedInstallments);
	const remainingInstallments = Math.max(0, purchase.totalInstallments - purchase.paidInstallments);

	return {
		unpaidBilledInstallments,
		futureInstallments,
		remainingInstallments,
		isCompleted: purchase.paidInstallments === purchase.totalInstallments
	};
}

export function getInstallmentAmounts(purchase: InstallmentPurchaseInput): InstallmentPurchaseAmounts {
	const paidAmountCents = sumInstallmentRange(purchase, 1, purchase.paidInstallments);
	const unpaidBilledAmountCents = sumInstallmentRange(
		purchase,
		purchase.paidInstallments + 1,
		purchase.billedInstallments
	);
	const futureAmountCents = sumInstallmentRange(
		purchase,
		purchase.billedInstallments + 1,
		purchase.totalInstallments
	);
	const outstandingAmountCents = unpaidBilledAmountCents + futureAmountCents;
	const nextInstallmentAmountCents = purchase.billedInstallments < purchase.totalInstallments
		? getInstallmentAmount(purchase, purchase.billedInstallments + 1)
		: 0;

	return {
		paidAmountCents,
		unpaidBilledAmountCents,
		futureAmountCents,
		outstandingAmountCents,
		nextInstallmentAmountCents
	};
}

export function summarizeInstallmentPurchases(purchases: InstallmentPurchaseInput[]): InstallmentPurchaseSummary {
	return purchases.reduce<InstallmentPurchaseSummary>(
		(summary, purchase) => {
			const amounts = getInstallmentAmounts(purchase);
			const counts = getInstallmentCounts(purchase);

			return {
				activePurchases: summary.activePurchases + (counts.isCompleted ? 0 : 1),
				completedPurchases: summary.completedPurchases + (counts.isCompleted ? 1 : 0),
				paidAmountCents: summary.paidAmountCents + amounts.paidAmountCents,
				unpaidBilledAmountCents: summary.unpaidBilledAmountCents + amounts.unpaidBilledAmountCents,
				futureAmountCents: summary.futureAmountCents + amounts.futureAmountCents,
				outstandingAmountCents: summary.outstandingAmountCents + amounts.outstandingAmountCents,
				nextInstallmentAmountCents: summary.nextInstallmentAmountCents + amounts.nextInstallmentAmountCents
			};
		},
		{
			activePurchases: 0,
			completedPurchases: 0,
			paidAmountCents: 0,
			unpaidBilledAmountCents: 0,
			futureAmountCents: 0,
			outstandingAmountCents: 0,
			nextInstallmentAmountCents: 0
		}
	);
}
