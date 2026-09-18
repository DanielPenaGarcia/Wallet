import Database from 'better-sqlite3';
import { existsSync } from 'node:fs';

const categorySeed = [
	{
		name: 'Alimentación',
		color: '#22C55E',
		isEssential: true,
		children: [
			{ name: 'Supermercado', isEssential: true, children: [] },
			{ name: 'Despensa', isEssential: true, children: [] },
			{ name: 'Restaurantes', isEssential: false, children: [] },
			{ name: 'Comida rápida', isEssential: false, children: [] },
			{ name: 'Cafeterías', isEssential: false, children: [] },
			{ name: 'Delivery', isEssential: false, children: [] }
		]
	},
	{
		name: 'Transporte',
		color: '#3B82F6',
		isEssential: true,
		children: [
			{ name: 'Transporte público', isEssential: true, children: [] },
			{ name: 'Gasolina', isEssential: true, children: [] },
			{ name: 'Uber / Taxi', isEssential: false, children: [] },
			{ name: 'Estacionamiento', isEssential: false, children: [] },
			{ name: 'Mantenimiento', isEssential: true, children: [] },
			{ name: 'Seguro vehicular', isEssential: true, children: [] }
		]
	},
	{
		name: 'Vivienda',
		color: '#F59E0B',
		isEssential: true,
		children: [
			{ name: 'Renta', isEssential: true, children: [] },
			{ name: 'Hipoteca', isEssential: true, children: [] },
			{ name: 'Mantenimiento', isEssential: true, children: [] },
			{ name: 'Muebles', isEssential: false, children: [] },
			{ name: 'Electrodomésticos', isEssential: false, children: [] },
			{ name: 'Artículos para el hogar', isEssential: true, children: [] }
		]
	},
	{
		name: 'Servicios',
		color: '#06B6D4',
		isEssential: true,
		children: [
			{ name: 'Electricidad', isEssential: true, children: [] },
			{ name: 'Agua', isEssential: true, children: [] },
			{ name: 'Gas', isEssential: true, children: [] },
			{ name: 'Internet', isEssential: true, children: [] },
			{ name: 'Telefonía', isEssential: true, children: [] },
			{ name: 'Streaming', isEssential: false, children: [] },
			{ name: 'Suscripciones digitales', isEssential: false, children: [] }
		]
	},
	{
		name: 'Salud',
		color: '#EF4444',
		isEssential: true,
		children: [
			{ name: 'Medicamentos', isEssential: true, children: [] },
			{ name: 'Consultas médicas', isEssential: true, children: [] },
			{ name: 'Dentista', isEssential: true, children: [] },
			{ name: 'Estudios médicos', isEssential: true, children: [] },
			{ name: 'Seguro médico', isEssential: true, children: [] },
			{ name: 'Lentes', isEssential: true, children: [] }
		]
	},
	{
		name: 'Cuidado personal',
		color: '#EC4899',
		isEssential: false,
		children: [
			{ name: 'Higiene personal', isEssential: true, children: [] },
			{ name: 'Corte de cabello', isEssential: false, children: [] },
			{ name: 'Cosméticos', isEssential: false, children: [] },
			{ name: 'Productos de belleza', isEssential: false, children: [] }
		]
	},
	{
		name: 'Educación',
		color: '#8B5CF6',
		isEssential: true,
		children: [
			{ name: 'Colegiatura', isEssential: true, children: [] },
			{ name: 'Cursos', isEssential: false, children: [] },
			{ name: 'Libros', isEssential: false, children: [] },
			{ name: 'Material escolar', isEssential: true, children: [] },
			{ name: 'Software educativo', isEssential: false, children: [] }
		]
	},
	{
		name: 'Entretenimiento',
		color: '#A855F7',
		isEssential: false,
		children: [
			{ name: 'Cine', isEssential: false, children: [] },
			{ name: 'Videojuegos', isEssential: false, children: [] },
			{ name: 'Eventos', isEssential: false, children: [] },
			{ name: 'Conciertos', isEssential: false, children: [] },
			{ name: 'Hobbies', isEssential: false, children: [] },
			{ name: 'Salidas', isEssential: false, children: [] }
		]
	},
	{
		name: 'Ropa',
		color: '#6366F1',
		isEssential: false,
		children: [
			{ name: 'Ropa', isEssential: false, children: [] },
			{ name: 'Calzado', isEssential: false, children: [] },
			{ name: 'Accesorios', isEssential: false, children: [] },
			{ name: 'Ropa de trabajo', isEssential: true, children: [] }
		]
	},
	{
		name: 'Deudas',
		color: '#DC2626',
		isEssential: true,
		children: [
			{ name: 'Tarjeta de crédito', isEssential: true, children: [] },
			{ name: 'Préstamos', isEssential: true, children: [] },
			{ name: 'Crédito personal', isEssential: true, children: [] },
			{ name: 'Intereses', isEssential: true, children: [] }
		]
	},
	{
		name: 'Familia',
		color: '#F97316',
		isEssential: false,
		children: [
			{ name: 'Apoyo familiar', isEssential: true, children: [] },
			{ name: 'Regalos', isEssential: false, children: [] },
			{ name: 'Mascotas', isEssential: true, children: [] },
			{ name: 'Celebraciones', isEssential: false, children: [] }
		]
	},
	{
		name: 'Tecnología',
		color: '#64748B',
		isEssential: false,
		children: [
			{ name: 'Computadoras', isEssential: false, children: [] },
			{ name: 'Celulares', isEssential: false, children: [] },
			{ name: 'Accesorios', isEssential: false, children: [] },
			{ name: 'Software', isEssential: false, children: [] },
			{ name: 'Reparaciones', isEssential: false, children: [] }
		]
	},
	{
		name: 'Viajes',
		color: '#14B8A6',
		isEssential: false,
		children: [
			{ name: 'Hospedaje', isEssential: false, children: [] },
			{ name: 'Transporte', isEssential: false, children: [] },
			{ name: 'Alimentación', isEssential: false, children: [] },
			{ name: 'Actividades', isEssential: false, children: [] }
		]
	},
	{
		name: 'Impuestos y comisiones',
		color: '#78716C',
		isEssential: true,
		children: [
			{ name: 'Impuestos', isEssential: true, children: [] },
			{ name: 'Comisiones bancarias', isEssential: true, children: [] },
			{ name: 'Trámites', isEssential: true, children: [] }
		]
	},
	{
		name: 'Otros',
		color: '#94A3B8',
		isEssential: false,
		children: [
			{ name: 'Imprevistos', isEssential: false, children: [] },
			{ name: 'Donaciones', isEssential: false, children: [] },
			{ name: 'Otros gastos', isEssential: false, children: [] }
		]
	}
];

const databaseUrl = process.env.DATABASE_URL ?? 'local.db';

if (!existsSync(databaseUrl)) {
	throw new Error(`Database file not found: ${databaseUrl}`);
}

const database = new Database(databaseUrl);
database.pragma('foreign_keys = ON');

const tableExists = database.prepare(`
	SELECT name
	FROM sqlite_master
	WHERE type = 'table' AND name = 'categories'
`).get();

if (!tableExists) {
	throw new Error('The categories table does not exist. Run migrations before seeding categories.');
}

const findRootCategory = database.prepare(`
	SELECT id, color, is_essential
	FROM categories
	WHERE name = ? AND parent_id IS NULL
`);

const findChildCategory = database.prepare(`
	SELECT id, color, is_essential
	FROM categories
	WHERE name = ? AND parent_id = ?
`);

const insertCategory = database.prepare(`
	INSERT INTO categories (id, name, color, parent_id, is_essential, created_at, updated_at)
	VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const updateCategory = database.prepare(`
	UPDATE categories
	SET color = ?, is_essential = ?, updated_at = ?
	WHERE id = ?
`);

const slugify = (value) =>
	value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

function findCategory(name, parentId) {
	return parentId ? findChildCategory.get(name, parentId) : findRootCategory.get(name);
}

function seedCategory(category, parentId = null, path = []) {
	const existingCategory = findCategory(category.name, parentId);
	const id = existingCategory?.id ?? `category-${[...path, slugify(category.name)].join('-')}`;
	const now = new Date().toISOString();
	const color = parentId ? null : category.color;
	const isEssential = category.isEssential ? 1 : 0;

	if (existingCategory) {
		const hasChanges = existingCategory.color !== color || existingCategory.is_essential !== isEssential;
		if (hasChanges) {
			updateCategory.run(color, isEssential, now, id);
			seedStats.updated += 1;
		}
	} else {
		insertCategory.run(id, category.name, color, parentId, isEssential, now, now);
		seedStats.inserted += 1;
	}

	for (const child of category.children ?? []) {
		seedCategory(child, id, [...path, slugify(category.name)]);
	}
}

const seedStats = { inserted: 0, updated: 0 };

database.transaction(() => {
	for (const category of categorySeed) seedCategory(category);
})();

console.log(
	`Seeded categories: ${seedStats.inserted} inserted, ${seedStats.updated} updated, ${categorySeed.length} root categories.`
);
