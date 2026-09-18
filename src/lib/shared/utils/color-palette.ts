import { colorInputToHex, type HexColor } from './color';
import type {
	ColorPalette,
	ColorPaletteRole,
	ColorPaletteTokens
} from '$lib/modules/color-palettes/types/color-palette.types';

const colorRoles: ColorPaletteRole[] = ['primary', 'secondary', 'tertiary', 'background', 'surface'];
const white = '#ffffff' satisfies HexColor;
const black = '#000000' satisfies HexColor;
const destructive = '#dc2626' satisfies HexColor;

export const colorPaletteStorageKey = 'wallet:color-palette-id';
export const colorPaletteStyleElementId = 'app-theme';

type RgbColor = {
	red: number;
	green: number;
	blue: number;
};

function hexToRgb(hex: HexColor): RgbColor {
	return {
		red: Number.parseInt(hex.slice(1, 3), 16),
		green: Number.parseInt(hex.slice(3, 5), 16),
		blue: Number.parseInt(hex.slice(5, 7), 16)
	};
}

function rgbToHex({ red, green, blue }: RgbColor): HexColor {
	const componentToHex = (component: number) =>
		Math.round(Math.min(255, Math.max(0, component))).toString(16).padStart(2, '0');

	return `#${componentToHex(red)}${componentToHex(green)}${componentToHex(blue)}`;
}

function relativeLuminance(hex: HexColor) {
	const toLinear = (component: number) => {
		const channel = component / 255;
		return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
	};
	const { red, green, blue } = hexToRgb(hex);
	return 0.2126 * toLinear(red) + 0.7152 * toLinear(green) + 0.0722 * toLinear(blue);
}

function contrastRatio(first: HexColor, second: HexColor) {
	const firstLuminance = relativeLuminance(first);
	const secondLuminance = relativeLuminance(second);
	const lightest = Math.max(firstLuminance, secondLuminance);
	const darkest = Math.min(firstLuminance, secondLuminance);

	return (lightest + 0.05) / (darkest + 0.05);
}

function readableForeground(background: HexColor): HexColor {
	return contrastRatio(background, black) >= contrastRatio(background, white) ? black : white;
}

function mixColors(base: HexColor, target: HexColor, amount: number): HexColor {
	const baseRgb = hexToRgb(base);
	const targetRgb = hexToRgb(target);

	return rgbToHex({
		red: baseRgb.red + (targetRgb.red - baseRgb.red) * amount,
		green: baseRgb.green + (targetRgb.green - baseRgb.green) * amount,
		blue: baseRgb.blue + (targetRgb.blue - baseRgb.blue) * amount
	});
}

function stateColor(base: HexColor, amount: number): HexColor {
	const target = relativeLuminance(base) > 0.55 ? black : white;
	return mixColors(base, target, amount);
}

function mutedForeground(base: HexColor, surface: HexColor): HexColor {
	return mixColors(base, surface, 0.42);
}

function subtleSurface(surface: HexColor, background: HexColor): HexColor {
	return mixColors(surface, background, 0.5);
}

function outlineColor(foreground: HexColor, surface: HexColor): HexColor {
	return mixColors(foreground, surface, 0.84);
}

export function normalizePaletteColor(color: string): HexColor {
	const normalizedColor = colorInputToHex(color);
	if (!normalizedColor) throw new Error(`Invalid color: ${color}`);
	return normalizedColor;
}

export function buildColorPaletteTokens(palette: Pick<ColorPalette, ColorPaletteRole>): ColorPaletteTokens {
	return colorRoles.reduce((tokens, role) => {
		const color = palette[role];

		return {
			...tokens,
			[role]: color,
			[`on-${role}`]: readableForeground(color),
			[`${role}-hover`]: stateColor(color, 0.08),
			[`${role}-pressed`]: stateColor(color, 0.16)
		};
	}, {} as ColorPaletteTokens);
}

export function buildColorPaletteCssVariables(palette: Pick<ColorPalette, ColorPaletteRole>) {
	const tokens = buildColorPaletteTokens(palette);
	const surfaceMuted = tokens['surface-hover'];
	const onSurfaceMuted = mutedForeground(tokens['on-surface'], tokens.surface);
	const onSurfaceVariant = mutedForeground(tokens['on-surface'], tokens.surface);
	const outline = outlineColor(tokens['on-surface'], tokens.surface);
	const primaryContainer = mixColors(tokens.primary, tokens.background, 0.86);

	return {
		'--background': tokens.background,
		'--on-background': tokens['on-background'],
		'--background-hover': tokens['background-hover'],
		'--background-pressed': tokens['background-pressed'],
		'--foreground': tokens['on-background'],
		'--surface': tokens.surface,
		'--on-surface': tokens['on-surface'],
		'--surface-hover': tokens['surface-hover'],
		'--surface-pressed': tokens['surface-pressed'],
		'--surface-subtle': subtleSurface(tokens.surface, tokens.background),
		'--surface-muted': surfaceMuted,
		'--on-surface-muted': onSurfaceMuted,
		'--on-surface-variant': onSurfaceVariant,
		'--card': tokens.surface,
		'--card-foreground': tokens['on-surface'],
		'--popover': tokens.surface,
		'--popover-foreground': tokens['on-surface'],
		'--primary': tokens.primary,
		'--on-primary': tokens['on-primary'],
		'--primary-hover': tokens['primary-hover'],
		'--primary-pressed': tokens['primary-pressed'],
		'--primary-foreground': tokens['on-primary'],
		'--primary-container': primaryContainer,
		'--secondary': tokens.secondary,
		'--on-secondary': tokens['on-secondary'],
		'--secondary-hover': tokens['secondary-hover'],
		'--secondary-pressed': tokens['secondary-pressed'],
		'--secondary-foreground': tokens['on-secondary'],
		'--tertiary': tokens.tertiary,
		'--on-tertiary': tokens['on-tertiary'],
		'--tertiary-hover': tokens['tertiary-hover'],
		'--tertiary-pressed': tokens['tertiary-pressed'],
		'--muted': surfaceMuted,
		'--muted-foreground': onSurfaceMuted,
		'--accent': primaryContainer,
		'--accent-foreground': tokens['on-background'],
		'--destructive': destructive,
		'--destructive-foreground': readableForeground(destructive),
		'--border': outline,
		'--outline': outline,
		'--input': outlineColor(tokens['on-surface'], tokens.surface),
		'--ring': tokens.primary
	} satisfies Record<`--${string}`, HexColor>;
}

export type ColorPaletteCssVariables = ReturnType<typeof buildColorPaletteCssVariables>;

export function applyCssVariables(
	style: CSSStyleDeclaration,
	variables: ColorPaletteCssVariables
) {
	for (const [name, value] of Object.entries(variables)) {
		style.setProperty(name, value);
	}
}

export function applyColorPaletteCssVariables(
	style: CSSStyleDeclaration,
	palette: Pick<ColorPalette, ColorPaletteRole>
) {
	applyCssVariables(style, buildColorPaletteCssVariables(palette));
}

export function toColorPaletteCssVariables(variables: ColorPaletteCssVariables): string {
	return Object.entries(variables)
		.map(([name, value]) => `${name}:${value}`)
		.join(';');
}

export function toColorPaletteRootStyle(cssVariables: string): string {
	return `html:root{${cssVariables}}`;
}
