export interface BaseThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
  background: string;
}

export interface ThemeColors extends BaseThemeColors {
  primaryForeground: string;
  primaryHover: string;
  primaryActive: string;
  secondaryForeground: string;
  secondaryHover: string;
  secondaryActive: string;
  tertiaryForeground: string;
  tertiaryHover: string;
  tertiaryActive: string;
}
