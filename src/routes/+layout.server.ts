import { colorPaletteService } from '$lib/server/color-palettes/color-palette.service';

import {
    buildColorPaletteCssVariables,
    toColorPaletteCssVariables
} from '$lib/shared/utils/color-palette';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
    const colorPalettes = await colorPaletteService.getColorPalettes();

    const defaultColorPalette = colorPalettes.find((palette) => palette.isDefault) ?? colorPalettes[0] ?? null;

    return {
        defaultColorPaletteId: defaultColorPalette?.id ?? null,
        defaultColorPaletteCssVariables: defaultColorPalette
            ? toColorPaletteCssVariables(buildColorPaletteCssVariables(defaultColorPalette))
            : '',
        colorPaletteCssVariables: colorPalettes.map((palette) => ({
            id: palette.id,
            isDefault: palette.isDefault,
            cssVariables: toColorPaletteCssVariables(buildColorPaletteCssVariables(palette))
        }))
    };
};
