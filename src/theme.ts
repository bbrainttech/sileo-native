import { createContext, useContext } from 'react';
import { DEFAULT_ROUNDNESS } from './constants';
import type { SileoAppearance, SileoState } from './types';

/* ---------------------------------- Types --------------------------------- */

export interface SileoGlassTheme {
  /** The UIGlassEffect style. */
  style: 'regular' | 'clear';
  /**
   * Tints the glass. The built-in themes tint it lightly so text stays
   * readable over busy content; set `transparent` for untinted glass.
   */
  tint: string;
  /** Pins the glass to light or dark instead of following the system. */
  colorScheme: 'auto' | 'light' | 'dark';
  /** Description text on glass, which sits on whatever is behind it. */
  description: string;
}

export interface SileoTheme {
  /** The surface color of a `solid` toast. */
  fill: string;
  /** Description text on a `solid` toast. */
  description: string;
  /** Title color. Leave unset to color the title by state. */
  title?: string;
  /** One color per state, for the badge, the title, and the buttons. */
  stateColors: Record<SileoState, string>;
  /** How opaque the state color is behind the badge and the buttons. */
  tones: { badge: number; button: number; buttonPressed: number };
  roundness: number;
  appearance: SileoAppearance;
  glass: SileoGlassTheme;
  /** Applied to every text in the toast. */
  fontFamily?: string;
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? Partial<T[K]> : T[K];
};

/** Any part of a theme. What is left out comes from the theme it is laid over. */
export type SileoThemeOverrides = DeepPartial<SileoTheme>;

/**
 * The Toaster's `theme`:
 *
 * - `light` / `dark` — the built-in themes for a light or a dark app
 * - `system` — whichever of the two matches the device
 * - an overrides object — laid over the default theme
 * - `{ light, dark }` — overrides for each, picked by the device's scheme
 */
export type SileoThemeProp =
  | 'light'
  | 'dark'
  | 'system'
  | SileoThemeOverrides
  | { light: SileoThemeOverrides; dark: SileoThemeOverrides };

/* -------------------------------- Built-ins ------------------------------- */

/*
 * The web stylesheet declares these in oklch, which React Native cannot
 * parse. These are the same colors in sRGB.
 */
const STATE_COLORS: Record<SileoState, string> = {
  success: '#3ac530',
  loading: '#737373',
  error: '#fb2c36',
  warning: '#f0b100',
  info: '#00a6f4',
  action: '#2b7fff',
};

/** No `theme` on the Toaster: a white toast, as on the web. */
export const defaultTheme: SileoTheme = {
  fill: '#FFFFFF',
  description: 'rgba(0, 0, 0, 0.5)',
  stateColors: STATE_COLORS,
  tones: { badge: 0.2, button: 0.15, buttonPressed: 0.25 },
  roundness: DEFAULT_ROUNDNESS,
  appearance: 'solid',
  glass: {
    style: 'regular',
    tint: 'rgba(255, 255, 255, 0.35)',
    colorScheme: 'auto',
    description: 'rgba(128, 128, 128, 0.9)',
  },
};

/**
 * Named for the app, not the toast, as on the web: a light app gets a dark
 * toast and a dark app a light one, so the toast stands off the page.
 */
export const themes: Record<'light' | 'dark', SileoTheme> = {
  light: {
    ...defaultTheme,
    fill: '#1a1a1a',
    description: 'rgba(255, 255, 255, 0.5)',
    glass: {
      ...defaultTheme.glass,
      tint: 'rgba(255, 255, 255, 0.45)',
      colorScheme: 'light',
      description: 'rgba(0, 0, 0, 0.55)',
    },
  },
  dark: {
    ...defaultTheme,
    fill: '#f2f2f2',
    description: 'rgba(0, 0, 0, 0.5)',
    glass: {
      ...defaultTheme.glass,
      tint: 'rgba(28, 28, 30, 0.45)',
      colorScheme: 'dark',
      description: 'rgba(255, 255, 255, 0.6)',
    },
  },
};

/* ---------------------------------- Merge --------------------------------- */

/** Lay `overrides` over `base` (the default theme unless given). */
export function createTheme(
  overrides: SileoThemeOverrides,
  base: SileoTheme = defaultTheme
): SileoTheme {
  return {
    ...base,
    ...overrides,
    stateColors: { ...base.stateColors, ...overrides.stateColors },
    tones: { ...base.tones, ...overrides.tones },
    glass: { ...base.glass, ...overrides.glass },
  } as SileoTheme;
}

const isPerScheme = (
  theme: SileoThemeProp
): theme is { light: SileoThemeOverrides; dark: SileoThemeOverrides } =>
  typeof theme === 'object' && 'light' in theme && 'dark' in theme;

export function resolveTheme(
  theme: SileoThemeProp | undefined,
  scheme: 'light' | 'dark'
): SileoTheme {
  if (theme === undefined) return defaultTheme;
  if (theme === 'light' || theme === 'dark') return themes[theme];
  if (theme === 'system') return themes[scheme];
  if (isPerScheme(theme)) return createTheme(theme[scheme], themes[scheme]);
  return createTheme(theme);
}

/* --------------------------------- Context -------------------------------- */

export interface SileoToastTheme extends SileoTheme {
  /** The toast's own fill: its `fill` option, or the theme's. */
  fill: string;
  /** The toast's current state. */
  state: SileoState;
  /** The current state's color. */
  tone: string;
  /** The appearance actually drawn, after falling back from `glass`. */
  appearance: SileoAppearance;
  /** The description color for the appearance actually drawn. */
  text: string;
}

export const SileoThemeContext = createContext<SileoToastTheme | null>(null);

/**
 * The colors of the toast being rendered, for custom descriptions and icons:
 * nothing inherits a color on native, so read them here instead.
 *
 * ```tsx
 * function Body() {
 *   const { tone, text } = useSileoTheme();
 *   return <Text style={{ color: text }}>Paid <Text style={{ color: tone }}>$49</Text></Text>;
 * }
 * ```
 */
export function useSileoTheme(): SileoToastTheme {
  const value = useContext(SileoThemeContext);
  if (!value) {
    throw new Error('useSileoTheme() is only available inside a toast.');
  }
  return value;
}
