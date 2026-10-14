import {
  type ComponentType,
  Fragment,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  AccessibilityInfo,
  AppState,
  Platform,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import {
  DEFAULT_TOAST_DURATION,
  VIEWPORT_GAP,
  VIEWPORT_PADDING,
  WIDTH,
} from './constants';
import { getGlass } from './glass-registry';
import { Sileo } from './sileo';
import {
  DEFAULT_POSITION,
  dismissToast,
  hosts,
  type SileoItem,
  store,
  timeoutKey,
} from './store';
import { resolveTheme, type SileoThemeProp } from './theme';
import type { SileoAppearance, SileoOptions, SileoPosition } from './types';

const pillAlign = (pos: SileoPosition) =>
  pos.includes('right') ? 'right' : pos.includes('center') ? 'center' : 'left';
const expandDir = (pos: SileoPosition) =>
  pos.startsWith('top') ? ('bottom' as const) : ('top' as const);

const NO_INSETS = { top: 0, right: 0, bottom: 0, left: 0 };

/* ---------------------------------- Types --------------------------------- */

export type SileoOffsetConfig = Partial<
  Record<'top' | 'right' | 'bottom' | 'left', number>
>;

export interface SileoToasterProps {
  children?: ReactNode;
  /** Where toasts go unless they say otherwise. Defaults to `top-center`. */
  position?: SileoPosition;
  /** Extra distance from the safe area, on top of the 12pt viewport padding. */
  offset?: number | SileoOffsetConfig;
  /** Defaults merged under every toast's options. */
  options?: Partial<SileoOptions>;
  /** `light`, `dark`, `system`, overrides, or `{ light, dark }` overrides. */
  theme?: SileoThemeProp;
  /** Overrides the theme's appearance. `glass` needs `import 'sileo-native/glass'`. */
  appearance?: SileoAppearance;
  /** Toast width, capped to the screen. Defaults to `350`. */
  width?: number;
  /**
   * Renders the toasts inside this component. Pass `FullWindowOverlay` from
   * `react-native-screens` to show them above native modals on iOS.
   */
  container?: ComponentType<{ children: ReactNode }>;
}

/* ------------------------------ Accessibility ----------------------------- */

/** iOS's Reduce Transparency, under which glass is drawn solid */
function useReduceTransparency() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let mounted = true;
    AccessibilityInfo.isReduceTransparencyEnabled().then((value) => {
      if (mounted) setReduced(value);
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setReduced
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduced;
}

let warnedGlass = false;

/* ------------------------------ Toaster Component ------------------------- */

export function Toaster({
  children,
  position = DEFAULT_POSITION,
  offset,
  options,
  theme,
  appearance,
  width = WIDTH,
  container: Container = Fragment,
}: SileoToasterProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const resolvedTheme = useMemo(
    () => resolveTheme(theme, scheme),
    [theme, scheme]
  );

  /*
   * Read the insets without requiring a provider: the context is null when
   * the app has no `SafeAreaProvider`, where `useSafeAreaInsets` would throw.
   */
  const insets = useContext(SafeAreaInsetsContext) ?? NO_INSETS;
  const window = useWindowDimensions();
  const reduceTransparency = useReduceTransparency();

  const toasts = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );

  /* --------------------------------- Hosting -------------------------------- */

  const [hostId, setHostId] = useState<number>();

  useLayoutEffect(() => {
    const id = hosts.add();
    setHostId(id);
    return () => hosts.remove(id);
  }, []);

  const activeHost = useSyncExternalStore(
    hosts.subscribe,
    hosts.getActive,
    hosts.getActive
  );
  const isActive = hostId !== undefined && hostId === activeHost;
  const activeRef = useRef(isActive);
  activeRef.current = isActive;

  useLayoutEffect(() => {
    if (!isActive) return;
    store.position = position;
    store.options = options;
  }, [isActive, position, options]);

  /* --------------------------------- Timers --------------------------------- */

  const [activeId, setActiveId] = useState<string>();

  const heldRef = useRef(false);
  const backgroundRef = useRef(false);
  const timersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const listRef = useRef(toasts);
  const latestRef = useRef<string | undefined>(undefined);
  const handlersCache = useRef(
    new Map<
      string,
      { interact: (active: boolean) => void; dismiss: () => void }
    >()
  );

  const clearAllTimers = useCallback(() => {
    for (const t of timersRef.current.values()) clearTimeout(t);
    timersRef.current.clear();
  }, []);

  const schedule = useCallback((items: SileoItem[]) => {
    if (!activeRef.current || heldRef.current || backgroundRef.current) return;

    for (const item of items) {
      if (item.exiting) continue;
      const key = timeoutKey(item);
      if (timersRef.current.has(key)) continue;

      if (item.duration === null) continue;
      const dur = item.duration ?? DEFAULT_TOAST_DURATION;
      if (dur <= 0) continue;

      timersRef.current.set(
        key,
        setTimeout(() => dismissToast(item.id), dur)
      );
    }
  }, []);

  useEffect(() => clearAllTimers, [clearAllTimers]);

  /* a Toaster that stands down for a newer one stops running timers too */
  useEffect(() => {
    if (isActive) schedule(listRef.current);
    else clearAllTimers();
  }, [isActive, schedule, clearAllTimers]);

  useEffect(() => {
    listRef.current = toasts;

    const toastKeys = new Set(toasts.map(timeoutKey));
    const toastIds = new Set(toasts.map((t) => t.id));
    for (const [key, timer] of timersRef.current) {
      if (!toastKeys.has(key)) {
        clearTimeout(timer);
        timersRef.current.delete(key);
      }
    }
    for (const id of handlersCache.current.keys()) {
      if (!toastIds.has(id)) handlersCache.current.delete(id);
    }

    schedule(toasts);
  }, [toasts, schedule]);

  /*
   * New on native: an app in the background is not being read, so its
   * toasts wait. They get their full duration again on return, as they do
   * after the pointer leaves on the web.
   */
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        if (!backgroundRef.current) return;
        backgroundRef.current = false;
        schedule(listRef.current);
      } else if (next === 'background') {
        backgroundRef.current = true;
        clearAllTimers();
      }
    });
    return () => sub.remove();
  }, [schedule, clearAllTimers]);

  const holdRef = useRef(() => {});
  const releaseRef = useRef(() => {});

  holdRef.current = () => {
    if (heldRef.current) return;
    heldRef.current = true;
    clearAllTimers();
  };

  releaseRef.current = () => {
    if (!heldRef.current) return;
    heldRef.current = false;
    schedule(listRef.current);
  };

  const latest = useMemo(() => {
    for (let i = toasts.length - 1; i >= 0; i--) {
      const t = toasts[i];
      if (t && !t.exiting) return t.id;
    }
    return undefined;
  }, [toasts]);

  useEffect(() => {
    latestRef.current = latest;
    setActiveId(latest);
  }, [latest]);

  /* the web `enter` / `leave` pair, driven by a tap instead of the pointer */
  const getHandlers = useCallback((toastId: string) => {
    let cached = handlersCache.current.get(toastId);
    if (cached) return cached;

    cached = {
      interact: (active: boolean) => {
        if (active) {
          setActiveId((prev) => (prev === toastId ? prev : toastId));
          holdRef.current();
        } else {
          setActiveId((prev) =>
            prev === latestRef.current ? prev : latestRef.current
          );
          releaseRef.current();
        }
      },
      dismiss: () => dismissToast(toastId),
    };

    handlersCache.current.set(toastId, cached);
    return cached;
  }, []);

  /* -------------------------------- Appearance ------------------------------ */

  const glass = getGlass();
  const glassReady = glass?.isAvailable && !reduceTransparency ? glass : null;

  const resolveAppearance = (requested: SileoAppearance): SileoAppearance => {
    if (requested !== 'glass') return 'solid';
    if (!glass && __DEV__ && !warnedGlass) {
      warnedGlass = true;
      console.warn(
        "sileo-native: appearance 'glass' needs `import 'sileo-native/glass'` " +
          '(and expo-glass-effect). Drawing solid toasts instead.'
      );
    }
    return glassReady ? 'glass' : 'solid';
  };

  /* --------------------------------- Layout --------------------------------- */

  const getViewportStyle = useCallback(
    (pos: SileoPosition): ViewStyle => {
      const o: SileoOffsetConfig =
        typeof offset === 'object'
          ? offset
          : offset === undefined
            ? {}
            : { top: offset, right: offset, bottom: offset, left: offset };

      const vertical: ViewStyle = pos.startsWith('top')
        ? { top: insets.top + (o.top ?? 0), flexDirection: 'column-reverse' }
        : { bottom: insets.bottom + (o.bottom ?? 0), flexDirection: 'column' };

      const horizontal: ViewStyle = pos.endsWith('left')
        ? { left: insets.left + (o.left ?? 0), alignItems: 'flex-start' }
        : pos.endsWith('right')
          ? { right: insets.right + (o.right ?? 0), alignItems: 'flex-end' }
          : { left: 0, right: 0, alignItems: 'center' };

      return { ...vertical, ...horizontal };
    },
    [offset, insets.top, insets.right, insets.bottom, insets.left]
  );

  const toastWidth = Math.max(
    0,
    Math.min(
      width,
      window.width - VIEWPORT_PADDING * 2 - insets.left - insets.right
    )
  );

  const activePositions = useMemo(() => {
    const map = new Map<SileoPosition, SileoItem[]>();
    for (const t of toasts) {
      const pos = t.position ?? position;
      const arr = map.get(pos);
      if (arr) {
        arr.push(t);
      } else {
        map.set(pos, [t]);
      }
    }
    return map;
  }, [toasts, position]);

  if (!isActive || activePositions.size === 0) return <>{children}</>;

  const toasterAppearance = appearance ?? resolvedTheme.appearance;

  return (
    <>
      {children}
      <Container>
        <GestureHandlerRootView
          style={StyleSheet.absoluteFill}
          pointerEvents="box-none"
        >
          {Array.from(activePositions, ([pos, items]) => {
            const pill = pillAlign(pos);
            const expand = expandDir(pos);

            return (
              <View
                key={pos}
                pointerEvents="box-none"
                accessibilityLiveRegion="polite"
                style={[s.viewport, getViewportStyle(pos)]}
              >
                {items.map((item) => {
                  const h = getHandlers(item.id);
                  const itemAppearance = resolveAppearance(
                    item.appearance ?? toasterAppearance
                  );
                  return (
                    <Sileo
                      key={item.id}
                      width={toastWidth}
                      theme={resolvedTheme}
                      appearance={itemAppearance}
                      glass={itemAppearance === 'glass' ? glassReady : null}
                      state={item.state}
                      title={item.title}
                      description={item.description}
                      position={pill}
                      expand={expand}
                      icon={item.icon}
                      fill={item.fill}
                      styles={item.styles}
                      button={item.button}
                      buttons={item.buttons}
                      buttonLayout={item.buttonLayout}
                      roundness={item.roundness}
                      exiting={item.exiting}
                      autoExpandDelayMs={item.autoExpandDelayMs}
                      autoCollapseDelayMs={item.autoCollapseDelayMs}
                      refreshKey={item.instanceId}
                      canExpand={activeId === undefined || activeId === item.id}
                      onInteract={h.interact}
                      onDismiss={h.dismiss}
                    />
                  );
                })}
              </View>
            );
          })}
        </GestureHandlerRootView>
      </Container>
    </>
  );
}

const s = StyleSheet.create({
  viewport: {
    position: 'absolute',
    zIndex: 50,
    padding: VIEWPORT_PADDING,
    gap: VIEWPORT_GAP,
  },
});
