import type { ColorPalette } from '$lib/modules/color-palettes/types/color-palette.types';
import type { LocalFormFeedback } from '$lib/local/finance-db';

export type ApplicationSettingsProps = {
	colorPalettes: ColorPalette[];
	selectedColorPaletteId: string | null;
	feedback?: LocalFormFeedback | null;
};
