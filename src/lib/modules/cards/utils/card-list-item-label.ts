import type { CardListItem } from '../types/card-list-item.types';

export type CardListItemLabelOptions = {
	includeCurrency?: boolean;
};

export function formatCardListItemLabel(
	card: Pick<CardListItem, 'alias' | 'currencyCode' | 'isDefault' | 'lastFourDigits'>,
	options: CardListItemLabelOptions = {}
) {
	const detail = card.isDefault ? 'Efectivo' : `•••• ${card.lastFourDigits}`;
	const parts = [card.alias, detail];
	if (options.includeCurrency) parts.push(card.currencyCode);
	return parts.join(' · ');
}
