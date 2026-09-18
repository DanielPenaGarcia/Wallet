import type { ColorPalette } from '$lib/modules/color-palettes/types/color-palette.types';

export interface ColorPaletteRepository {
	findDefault(): Promise<ColorPalette | undefined>;
	list(): Promise<ColorPalette[]>;
}
