import type { HexColor } from '$lib/shared/utils/color';

export type ColorPaletteRole = 'primary' | 'secondary' | 'tertiary' | 'background' | 'surface';

export type ColorPalette = Record<ColorPaletteRole, HexColor> & {
	id: string;
	name: string;
	isDefault: boolean;
	createdAt: string;
	updatedAt: string;
};

export type ColorPaletteTokenName =
	| ColorPaletteRole
	| `on-${ColorPaletteRole}`
	| `${ColorPaletteRole}-hover`
	| `${ColorPaletteRole}-pressed`;

export type ColorPaletteTokens = Record<ColorPaletteTokenName, HexColor>;
