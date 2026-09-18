export const cardBalanceAdjustmentTitles = {
	favorable: 'Ajuste a favor - saldo',
	unfavorable: 'Cargo no reconocido - balance'
} as const;

type CardBalanceAdjustmentMovement = {
	title: string;
};

export function isCardBalanceAdjustmentMovement(movement: CardBalanceAdjustmentMovement) {
	return (
		movement.title === cardBalanceAdjustmentTitles.favorable ||
		movement.title === cardBalanceAdjustmentTitles.unfavorable
	);
}
