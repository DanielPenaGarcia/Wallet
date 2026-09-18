import type { ThemeColors } from "$lib/shared/types/theme.types";
import {
  buildThemeColors,
  contrastRatio,
  DEFAULT_BASE_THEME,
  DEFAULT_THEME,
  toThemeCssVariables as toSharedThemeCssVariables,
} from "./theme.utils";

export const DEFAULT_STOREFRONT_BASE_THEME = DEFAULT_BASE_THEME;

export function buildStorefrontThemeColors(
  input: Partial<ThemeColors> = DEFAULT_STOREFRONT_BASE_THEME,
): ThemeColors {
  return buildThemeColors(input);
}

export const DEFAULT_STOREFRONT_THEME = DEFAULT_THEME;

export { contrastRatio };

export function toThemeCssVariables(theme: ThemeColors): string {
  return toSharedThemeCssVariables(theme, "storefront");
}
