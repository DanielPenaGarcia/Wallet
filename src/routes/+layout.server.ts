import { colorPaletteService } from '$lib/server/color-palettes/color-palette.service';
import { buildColorPaletteCssVariables } from '$lib/shared/utils/color-palette';

export async function load() {
	const colorPalettes = await colorPaletteService.getColorPalettes();
	const defaultColorPalette = colorPalettes.find((palette) => palette.isDefault) ?? colorPalettes[0] ?? null;

	return {
		defaultColorPaletteId: defaultColorPalette?.id ?? null,
		colorPaletteCssVariables: colorPalettes.map((palette) => ({
			id: palette.id,
			isDefault: palette.isDefault,
			variables: buildColorPaletteCssVariables(palette)
		}))
	};
}
