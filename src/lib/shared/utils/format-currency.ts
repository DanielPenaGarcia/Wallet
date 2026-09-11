export function formatCurrencyFromMinorUnits(amount: number, currencyCode: string): string {
	return new Intl.NumberFormat('es-MX', {
		style: 'currency',
		currency: currencyCode,
		minimumFractionDigits: 2
	}).format(amount / 100);
}
