import type {
  BaseThemeColors,
  ThemeColors,
} from "$lib/shared/types/theme.types";

function parseHexColor(color: string): [number, number, number] {
  return [
    Number.parseInt(color.slice(1, 3), 16),
    Number.parseInt(color.slice(3, 5), 16),
    Number.parseInt(color.slice(5, 7), 16),
  ];
}

function toHexColor(channels: number[]): string {
  return `#${channels
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

const HEX_COLOR_PATTERN = /^#[0-9A-F]{6}$/i;

export function normalizeThemeColor(color: string, fallback: string): string {
  return HEX_COLOR_PATTERN.test(color) ? color.toUpperCase() : fallback;
}

function relativeLuminance(color: string): number {
  const [red, green, blue] = parseHexColor(color).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(firstColor: string, secondColor: string): number {
  const firstLuminance = relativeLuminance(firstColor);
  const secondLuminance = relativeLuminance(secondColor);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

const LIGHT_FOREGROUND = "#FFFFFF";
const DARK_FOREGROUND = "#0F172A";
const FALLBACK_DARK_FOREGROUND = "#000000";
const MINIMUM_TEXT_CONTRAST = 4.5;

export function foregroundFor(background: string): string {
  for (const candidate of [
    LIGHT_FOREGROUND,
    DARK_FOREGROUND,
    FALLBACK_DARK_FOREGROUND,
  ]) {
    if (contrastRatio(background, candidate) >= MINIMUM_TEXT_CONTRAST) {
      return candidate;
    }
  }

  return contrastRatio(background, LIGHT_FOREGROUND) >=
    contrastRatio(background, FALLBACK_DARK_FOREGROUND)
    ? LIGHT_FOREGROUND
    : FALLBACK_DARK_FOREGROUND;
}

function mixColor(color: string, target: string, amount: number): string {
  const sourceChannels = parseHexColor(color);
  const targetChannels = parseHexColor(target);

  return toHexColor(
    sourceChannels.map(
      (channel, index) => channel + (targetChannels[index] - channel) * amount,
    ),
  );
}

const HOVER_MIX_AMOUNT = 0.08;
const ACTIVE_MIX_AMOUNT = 0.14;

function interactiveColors(
  color: string,
  foreground: string,
): { hover: string; active: string } {
  const target =
    foreground === LIGHT_FOREGROUND
      ? FALLBACK_DARK_FOREGROUND
      : LIGHT_FOREGROUND;

  return {
    hover: mixColor(color, target, HOVER_MIX_AMOUNT),
    active: mixColor(color, target, ACTIVE_MIX_AMOUNT),
  };
}

export const DEFAULT_BASE_THEME: BaseThemeColors = {
  primary: "#000000",
  secondary: "#404040",
  tertiary: "#737373",
  background: "#ffffff",
};

export function buildThemeColors(
  input: Partial<BaseThemeColors> = DEFAULT_BASE_THEME,
): ThemeColors {
  const primary = normalizeThemeColor(
    input.primary ?? "",
    DEFAULT_BASE_THEME.primary,
  );
  const secondary = normalizeThemeColor(
    input.secondary ?? "",
    DEFAULT_BASE_THEME.secondary,
  );
  const tertiary = normalizeThemeColor(
    input.tertiary ?? "",
    DEFAULT_BASE_THEME.tertiary,
  );

  const background = normalizeThemeColor(
    input.background ?? "",
    DEFAULT_BASE_THEME.background,
  );

  const primaryForeground = foregroundFor(primary);
  const secondaryForeground = foregroundFor(secondary);
  const tertiaryForeground = foregroundFor(tertiary);
  const backgroundForeground = foregroundFor(background);
  const primaryStates = interactiveColors(primary, primaryForeground);
  const secondaryStates = interactiveColors(secondary, secondaryForeground);
  const tertiaryStates = interactiveColors(tertiary, tertiaryForeground);

  return {
    primary,
    primaryForeground,
    primaryHover: primaryStates.hover,
    primaryActive: primaryStates.active,
    secondary,
    secondaryForeground,
    secondaryHover: secondaryStates.hover,
    secondaryActive: secondaryStates.active,
    tertiary,
    tertiaryForeground,
    tertiaryHover: tertiaryStates.hover,
    tertiaryActive: tertiaryStates.active,
    backgroundForeground,
    background,
  };
}

export const DEFAULT_THEME = buildThemeColors();

export function toThemeCssVariables(theme: ThemeColors): string {
  return [
    ["primary", theme.primary],
    ["on-primary", theme.primaryForeground],
    ["primary-hover", theme.primaryHover],
    ["primary-pressed", theme.primaryActive],

    ["secondary", theme.secondary],
    ["on-secondary", theme.secondaryForeground],
    ["secondary-hover", theme.secondaryHover],
    ["secondary-pressed", theme.secondaryActive],

    ["tertiary", theme.tertiary],
    ["on-tertiary", theme.tertiaryForeground],
    ["tertiary-hover", theme.tertiaryHover],
    ["tertiary-pressed", theme.tertiaryActive],

    ["background", theme.background],
    ["on-background", theme.backgroundForeground],
  ]
    .map(([name, value]) => `--${name}:${value}`)
    .join(";");
}
