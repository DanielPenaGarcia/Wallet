export type HexColor = `#${string}`;

const hexColorPattern = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const rgbColorPattern =
	/^rgba?\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i;

function componentToHex(component: number) {
	return component.toString(16).padStart(2, '0');
}

function expandedHex(value: string): HexColor {
	const normalized = value.toLowerCase();
	if (normalized.length === 7) return normalized as HexColor;

	return `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
}

export function colorInputToHex(value: string): HexColor | null {
	const trimmed = value.trim();
	if (hexColorPattern.test(trimmed)) return expandedHex(trimmed);

	const rgbMatch = trimmed.match(rgbColorPattern);
	if (!rgbMatch) return null;

	const [red, green, blue] = rgbMatch.slice(1, 4).map(Number);
	if ([red, green, blue].some((component) => component < 0 || component > 255)) return null;

	return `#${componentToHex(red)}${componentToHex(green)}${componentToHex(blue)}`;
}

export function isColorInput(value: unknown): value is string {
	return typeof value === 'string' && colorInputToHex(value) !== null;
}

export function normalizeColorInput(value: string, fallback: HexColor): HexColor {
	return colorInputToHex(value) ?? fallback;
}
