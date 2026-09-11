import type { CardColor } from '../types/card.types';

export const fallbackCardColor: CardColor = '#123a63';

export function isCardColor(value: unknown): value is CardColor {
	return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
}

export function normalizeCardColor(value: string): CardColor {
	return isCardColor(value) ? value : fallbackCardColor;
}
