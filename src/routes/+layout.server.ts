import { colorPaletteService } from '$lib/server/color-palettes/color-palette.service';
import { buildColorPaletteCssVariables } from '$lib/shared/utils/color-palette';
import { buildStorefrontThemeColors } from '$lib/utils/color-palette.utils';

export async function load() {
	const colorPalettes = await colorPaletteService.getColorPalettes();
	const defaultColorPalette = colorPalettes.find((palette) => palette.isDefault) ?? colorPalettes[0] ?? null;
	const colorPalette = buildStorefrontThemeColors(defaultColorPalette);
	return {
		colorPalette,
		colorPaletteCssVariables: colorPalettes.map((palette) => ({
			id: palette.id,
			isDefault: palette.isDefault,
			variables: buildColorPaletteCssVariables(palette)
		}))
	};
}
