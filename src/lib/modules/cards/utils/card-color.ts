import type { CardColor } from '../types/card.types';
import { isColorInput, normalizeColorInput } from '$lib/shared/utils/color';

export const fallbackCardColor: CardColor = '#123a63';

export function isCardColor(value: unknown): value is CardColor {
	return isColorInput(value);
}

export function normalizeCardColor(value: string): CardColor {
	return normalizeColorInput(value, fallbackCardColor) as CardColor;
}
