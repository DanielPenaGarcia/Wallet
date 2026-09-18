import { desc, eq } from 'drizzle-orm';
import type { ColorPalette } from '$lib/modules/color-palettes/types/color-palette.types';
import { db, type Database } from '$lib/server/db';
import { colorPalettes } from '$lib/server/db/schema';
import { normalizePaletteColor } from '$lib/shared/utils/color-palette';
import type { ColorPaletteRepository } from './color-palette.repository';

class DrizzleColorPaletteRepository implements ColorPaletteRepository {
	constructor(private readonly database: Database = db) {}

	async findDefault() {
		const palette = await this.database.query.colorPalettes.findFirst({
			where: (colorPalette, { eq }) => eq(colorPalette.isDefault, true)
		});

		return palette ? this.toColorPalette(palette) : undefined;
	}

	async list() {
		const palettes = await this.database.select().from(colorPalettes).orderBy(desc(colorPalettes.isDefault), colorPalettes.name);
		return palettes.map((palette) => this.toColorPalette(palette));
	}

	private toColorPalette(palette: typeof colorPalettes.$inferSelect): ColorPalette {
		return {
			id: palette.id,
			name: palette.name,
			primary: normalizePaletteColor(palette.primary),
			secondary: normalizePaletteColor(palette.secondary),
			tertiary: normalizePaletteColor(palette.tertiary),
			background: normalizePaletteColor(palette.background),
			surface: normalizePaletteColor(palette.surface),
			isDefault: palette.isDefault,
			createdAt: palette.createdAt,
			updatedAt: palette.updatedAt
		};
	}
}

export const drizzleColorPaletteRepository = new DrizzleColorPaletteRepository();
