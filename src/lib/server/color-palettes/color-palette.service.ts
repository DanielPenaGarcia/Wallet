import type { ColorPalette } from '$lib/modules/color-palettes/types/color-palette.types';
import { buildColorPaletteTokens } from '$lib/shared/utils/color-palette';
import type { ColorPaletteRepository } from './color-palette.repository';
import { drizzleColorPaletteRepository } from './drizzle-color-palette.repository';

export class ColorPaletteService {
	constructor(private readonly colorPaletteRepository: ColorPaletteRepository) {}

	getColorPalettes(): Promise<ColorPalette[]> {
		return this.colorPaletteRepository.list();
	}

	async getDefaultColorPalette(): Promise<ColorPalette | undefined> {
		return this.colorPaletteRepository.findDefault();
	}

	async getDefaultColorPaletteTokens() {
		const palette = await this.getDefaultColorPalette();
		return palette ? buildColorPaletteTokens(palette) : null;
	}
}

export const colorPaletteService = new ColorPaletteService(drizzleColorPaletteRepository);
