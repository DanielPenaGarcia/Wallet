import Database from 'better-sqlite3';
import { existsSync } from 'node:fs';

const colorPaletteSeed = [
	{
		id: 'color-palette-black-white',
		name: 'Noir absolutista',
		primary: '#000000',
		secondary: '#404040',
		tertiary: '#737373',
		background: '#ffffff',
		surface: '#f5f5f5',
		isDefault: true
	},
	{
		id: 'color-palette-elegante-cacao',
		name: 'Elegante cacao',
		primary: '#4A1C0A',
		secondary: '#EBD5B0',
		tertiary: '#8A5A3B',
		background: '#FFF8EC',
		surface: '#F3E2C4',
		isDefault: false
	},
	{
		id: 'color-palette-fancy-menta',
		name: 'Fancy menta',
		primary: '#1C2B3A',
		secondary: '#A8D8C8',
		tertiary: '#5F9E8E',
		background: '#F4FAF8',
		surface: '#DDEFE9',
		isDefault: false
	},
	{
		id: 'color-palette-dorado-editorial',
		name: 'Dorado editorial',
		primary: '#F5C842',
		secondary: '#2A1505',
		tertiary: '#8A5A16',
		background: '#FFF8E3',
		surface: '#FBE9A7',
		isDefault: false
	},
	{
		id: 'color-palette-azul-ejecutivo',
		name: 'Azul ejecutivo',
		primary: '#0D1B4B',
		secondary: '#A8D8EA',
		tertiary: '#4D6DAE',
		background: '#F4FAFD',
		surface: '#DCEFF7',
		isDefault: false
	},
	{
		id: 'color-palette-coral-botanico',
		name: 'Coral botánico',
		primary: '#59B292',
		secondary: '#FA6781',
		tertiary: '#FAE7CB',
		background: '#FFF8EE',
		surface: '#E5F3ED',
		isDefault: false
	}
];

const databaseUrl = process.env.DATABASE_URL ?? 'local.db';

if (!existsSync(databaseUrl)) {
	throw new Error(`Database file not found: ${databaseUrl}`);
}

const database = new Database(databaseUrl);

const tableExists = database.prepare(`
	SELECT name
	FROM sqlite_master
	WHERE type = 'table' AND name = 'color_palettes'
`).get();

if (!tableExists) {
	throw new Error('The color_palettes table does not exist. Run migrations before seeding color palettes.');
}

const findPalette = database.prepare(`
	SELECT id, name, \`primary\`, secondary, tertiary, background, surface, is_default
	FROM color_palettes
	WHERE id = ?
`);

const insertPalette = database.prepare(`
	INSERT INTO color_palettes (
		id,
		name,
		\`primary\`,
		secondary,
		tertiary,
		background,
		surface,
		is_default,
		created_at,
		updated_at
	)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updatePalette = database.prepare(`
	UPDATE color_palettes
	SET
		name = ?,
		\`primary\` = ?,
		secondary = ?,
		tertiary = ?,
		background = ?,
		surface = ?,
		is_default = ?,
		updated_at = ?
	WHERE id = ?
`);

const clearOtherDefaults = database.prepare(`
	UPDATE color_palettes
	SET is_default = false, updated_at = ?
	WHERE id != ?
`);

function hasChanges(existingPalette, palette) {
	return (
		existingPalette.name !== palette.name ||
		existingPalette.primary !== palette.primary ||
		existingPalette.secondary !== palette.secondary ||
		existingPalette.tertiary !== palette.tertiary ||
		existingPalette.background !== palette.background ||
		existingPalette.surface !== palette.surface ||
		existingPalette.is_default !== Number(palette.isDefault)
	);
}

const seedStats = { inserted: 0, updated: 0 };

database.transaction(() => {
	for (const palette of colorPaletteSeed) {
		const now = new Date().toISOString();
		const existingPalette = findPalette.get(palette.id);
		const isDefault = palette.isDefault ? 1 : 0;

		if (palette.isDefault) clearOtherDefaults.run(now, palette.id);

		if (!existingPalette) {
			insertPalette.run(
				palette.id,
				palette.name,
				palette.primary,
				palette.secondary,
				palette.tertiary,
				palette.background,
				palette.surface,
				isDefault,
				now,
				now
			);
			seedStats.inserted += 1;
			continue;
		}

		if (hasChanges(existingPalette, palette)) {
			updatePalette.run(
				palette.name,
				palette.primary,
				palette.secondary,
				palette.tertiary,
				palette.background,
				palette.surface,
				isDefault,
				now,
				palette.id
			);
			seedStats.updated += 1;
		}
	}
})();

console.log(
	`Seeded color palettes: ${seedStats.inserted} inserted, ${seedStats.updated} updated, ${colorPaletteSeed.length} palettes.`
);
