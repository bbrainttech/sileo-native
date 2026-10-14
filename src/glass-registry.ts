import type { ComponentType, ReactNode } from 'react';
import type { ViewProps } from 'react-native';

/*
 * `expo-glass-effect` is optional, so the core never imports it. Importing
 * `sileo-native/glass` registers its components here; until then `glass` toasts
 * draw as `solid`. A static import keeps bundlers that do not allow optional
 * requires (bare Metro among them) from failing on apps without the package.
 */

type GlassStyle = 'regular' | 'clear' | 'none';

export interface GlassViewProps extends ViewProps {
  glassEffectStyle?:
    | GlassStyle
    | { style: GlassStyle; animate?: boolean; animationDuration?: number };
  tintColor?: string;
  colorScheme?: 'auto' | 'light' | 'dark';
  isInteractive?: boolean;
}

export interface GlassContainerProps extends ViewProps {
  spacing?: number;
  children?: ReactNode;
}

export interface GlassModule {
  GlassView: ComponentType<GlassViewProps>;
  GlassContainer: ComponentType<GlassContainerProps>;
  /** whether this device can draw Liquid Glass at all */
  isAvailable: boolean;
}

let registered: GlassModule | null = null;

export const registerGlass = (glass: GlassModule) => {
  registered = glass;
};

export const getGlass = () => registered;
