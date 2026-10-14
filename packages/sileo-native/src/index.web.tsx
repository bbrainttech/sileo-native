/*
 * On the web, sileo-native is sileo: the original package, which this one
 * ports. The options are mapped from their native shape — the native-only
 * parts (style objects, glass, more than one button) have no web equivalent
 * and are dropped.
 */
import type { ReactNode } from 'react';
import { sileo as web, Toaster as WebToaster } from 'sileo';
import {
  createTheme,
  defaultTheme,
  type SileoThemeProp,
  type SileoToastTheme,
  themes,
} from './theme';
import type { SileoOptions, SileoPosition } from './types';
import type { SileoPromiseOptions } from './store';
import type { SileoToasterProps } from './toaster';

type WebOptions = Parameters<typeof web.show>[0];

const toWeb = (opts: SileoOptions): WebOptions => {
  const first = opts.buttons?.[0] ?? opts.button;
  return {
    title: opts.title,
    description: opts.description,
    type: opts.type,
    position: opts.position,
    duration: opts.duration,
    icon: opts.icon,
    fill: opts.fill,
    roundness: opts.roundness,
    autopilot: opts.autopilot,
    button: first
      ? { title: first.title, onClick: first.onPress ?? first.onClick }
      : undefined,
  };
};

const toWebPromise = <T,>(opts: SileoPromiseOptions<T>) => ({
  loading: toWeb(opts.loading),
  success:
    typeof opts.success === 'function'
      ? (data: T) => toWeb((opts.success as (d: T) => SileoOptions)(data))
      : toWeb(opts.success),
  error:
    typeof opts.error === 'function'
      ? (err: unknown) =>
          toWeb((opts.error as (e: unknown) => SileoOptions)(err))
      : toWeb(opts.error),
  action:
    opts.action === undefined
      ? undefined
      : typeof opts.action === 'function'
        ? (data: T) => toWeb((opts.action as (d: T) => SileoOptions)(data))
        : toWeb(opts.action),
  position: opts.position,
});

export const sileo = {
  show: (opts: SileoOptions) => web.show(toWeb(opts)),
  success: (opts: SileoOptions) => web.success(toWeb(opts)),
  error: (opts: SileoOptions) => web.error(toWeb(opts)),
  warning: (opts: SileoOptions) => web.warning(toWeb(opts)),
  info: (opts: SileoOptions) => web.info(toWeb(opts)),
  action: (opts: SileoOptions) => web.action(toWeb(opts)),
  promise: <T,>(
    promise: Promise<T> | (() => Promise<T>),
    opts: SileoPromiseOptions<T>
  ): Promise<T> => web.promise(promise, toWebPromise(opts)),
  dismiss: (id: string) => web.dismiss(id),
  clear: (position?: SileoPosition) => web.clear(position),
};

const webTheme = (theme: SileoThemeProp | undefined) =>
  theme === 'light' || theme === 'dark' || theme === 'system'
    ? { theme, fill: undefined }
    : theme === undefined
      ? { theme: undefined, fill: undefined }
      : {
          theme: undefined,
          fill: createTheme('light' in theme ? theme.light : theme).fill,
        };

export function Toaster({
  children,
  position,
  offset,
  options,
  theme,
}: SileoToasterProps): ReactNode {
  const { theme: named, fill } = webTheme(theme);
  return (
    <WebToaster
      position={position}
      offset={offset}
      theme={named}
      options={{ ...(options && toWeb(options)), ...(fill && { fill }) }}
    >
      {children}
    </WebToaster>
  );
}

/** Web toasts carry no theme context; this returns the default theme's colors. */
export function useSileoTheme(): SileoToastTheme {
  return {
    ...defaultTheme,
    state: 'success',
    tone: defaultTheme.stateColors.success,
    text: defaultTheme.description,
  };
}

export { createTheme, defaultTheme, themes };
export type { SileoPromiseOptions } from './store';
export type { SileoOffsetConfig, SileoToasterProps } from './toaster';
export type {
  SileoGlassTheme,
  SileoTheme,
  SileoThemeOverrides,
  SileoThemeProp,
  SileoToastTheme,
} from './theme';
export {
  SILEO_POSITIONS,
  type SileoAppearance,
  type SileoAutopilot,
  type SileoButton,
  type SileoButtons,
  type SileoOptions,
  type SileoPosition,
  type SileoState,
  type SileoStyles,
  type SileoVariant,
} from './types';
