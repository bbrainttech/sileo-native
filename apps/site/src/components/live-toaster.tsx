import { usePathname } from 'expo-router';
import {
  type ComponentType,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { StyleSheet, View } from 'react-native';
import type { SileoToasterProps } from '../../../../packages/sileo-native/src/toaster';
import {
  createTheme,
  type SileoThemeOverrides,
  store,
  themes,
} from '../lib/sileo';
import { FONT, palettes, useSite } from '../lib/site';

type ToasterComponent = ComponentType<SileoToasterProps>;

/*
 * CanvasKit is a ~3MB wasm download, and Skia captures it when its module is
 * first evaluated, so the Toaster can only be imported once it has loaded.
 * Both happen once, on demand.
 */
let loading: Promise<ToasterComponent> | null = null;

const loadToaster = () => {
  loading ??= (async () => {
    const { LoadSkiaWeb } =
      await import('@shopify/react-native-skia/lib/module/web');
    await LoadSkiaWeb({ locateFile: (file: string) => `/${file}` });
    const { Toaster } = await import('../lib/native-toaster');
    return Toaster;
  })();
  return loading;
};

/*
 * The rayanstudio primary: #155dfc in light mode, and in dark mode the dark
 * primary at 65% over the page, as rayanstudio's filled surfaces do. State
 * colors are light shades so they read on blue.
 */
const ON_BLUE = {
  success: '#86efac',
  error: '#fecaca',
  warning: '#fde68a',
  info: '#bae6fd',
  action: '#ffffff',
  loading: '#dbeafe',
};

const BRAND: Record<'light' | 'dark', SileoThemeOverrides> = {
  light: {
    fill: '#155dfc',
    description: 'rgba(255, 255, 255, 0.75)',
    stateColors: ON_BLUE,
  },
  dark: {
    fill: '#1f56aa',
    description: 'rgba(255, 255, 255, 0.7)',
    stateColors: ON_BLUE,
  },
};

const hasToasts = () => store.toasts.length > 0;

const OPTIONS = { duration: 7000 };

/**
 * The site's one Toaster: sileo-native's own renderer, running on the web.
 * The home page and the playground load it straight away; any other page
 * loads it with its first toast.
 */
export function LiveToaster() {
  const { scheme, toaster } = useSite();
  const pathname = usePathname();
  const pending = useSyncExternalStore(store.subscribe, hasToasts, () => false);
  const preload = pathname === '/' || pathname === '/play';
  const [Toaster, setToaster] = useState<ToasterComponent | null>(null);

  useEffect(() => {
    if (Toaster || !(pending || preload)) return;
    let alive = true;
    loadToaster()
      .then((component) => {
        if (alive) setToaster(() => component);
      })
      .catch((error) => console.error('sileo-native: toaster failed', error));
    return () => {
      alive = false;
    };
  }, [Toaster, pending, preload]);

  /* as on rayanstudio: the fill is the foreground, so toasts invert against
     the page, with the description at the background's 80% */
  const theme = useMemo(
    () =>
      createTheme(
        {
          fontFamily: FONT,
          fill: palettes[scheme].fg,
          description:
            scheme === 'dark'
              ? 'rgba(9, 9, 11, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
          ...(toaster.brand ? BRAND[scheme] : {}),
        },
        themes[scheme]
      ),
    [scheme, toaster.brand]
  );

  if (!Toaster) return null;

  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <Toaster
        position={toaster.position}
        theme={theme}
        offset={8}
        options={OPTIONS}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
  },
});
