import type { ColorPalette } from '$lib/modules/color-palettes/types/color-palette.types';

export type ApplicationSettingsProps = {
	colorPalettes: ColorPalette[];
	selectedColorPaletteId: string | null;
};
