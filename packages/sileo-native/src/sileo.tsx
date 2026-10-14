import {
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  type AccessibilityActionEvent,
  AccessibilityInfo,
  type LayoutChangeEvent,
  Platform,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { withAlpha } from './color';
import {
  BLUR_RATIO,
  DURATION_MS,
  HEADER_PADDING,
  HEIGHT,
  MIN_EXPAND_RATIO,
  PILL_PADDING,
  SPRING,
  SPRING_FAST,
  SPRING_NO_BOUNCE,
  SWAP_COLLAPSE_MS,
  SWIPE_DISMISS,
  SWIPE_MAX,
} from './constants';
import type { GlassModule } from './glass-registry';
import { GlassSurface } from './glass-surface';
import { GooeyCanvas } from './gooey-canvas';
import { Header } from './header';
import { type SileoTheme, SileoThemeContext } from './theme';
import { ToastButton } from './toast-button';
import type {
  SileoAppearance,
  SileoButton,
  SileoButtons,
  SileoState,
  SileoStyles,
} from './types';

type State = SileoState;

interface ToastView {
  title?: string;
  description?: ReactNode;
  state: State;
  icon?: ReactNode | null;
  styles?: SileoStyles;
  buttons?: readonly SileoButton[];
  fill: string;
}

export interface SileoProps {
  width: number;
  theme: SileoTheme;
  /** the appearance to draw, already resolved against what the device supports */
  appearance: SileoAppearance;
  /** set when `appearance` is `glass` */
  glass: GlassModule | null;
  fill?: string;
  state?: State;
  title?: string;
  description?: ReactNode;
  position?: 'left' | 'center' | 'right';
  expand?: 'top' | 'bottom';
  icon?: ReactNode | null;
  styles?: SileoStyles;
  button?: SileoButton;
  buttons?: SileoButtons;
  buttonLayout?: 'row' | 'column';
  roundness?: number;
  exiting?: boolean;
  autoExpandDelayMs?: number;
  autoCollapseDelayMs?: number;
  canExpand?: boolean;
  refreshKey?: string;
  /** a person has opened (`true`) or closed (`false`) the toast — the web hover */
  onInteract?: (active: boolean) => void;
  onDismiss?: () => void;
}

/** CSS `ease`, which the web build uses for the content fade */
const EASE = Easing.bezier(0.25, 0.1, 0.25, 1);

/** past this the swipe dismisses whatever the distance */
const SWIPE_VELOCITY = 800;

const NO_BUTTONS: readonly SileoButton[] = [];

type AccessibilityAction = NonNullable<
  ViewProps['accessibilityActions']
>[number];

/* ------------------------------- Component -------------------------------- */

export const Sileo = memo(function Sileo({
  width,
  theme,
  appearance,
  glass,
  fill = theme.fill,
  state = 'success',
  title = state,
  description,
  position = 'left',
  expand = 'bottom',
  icon,
  styles,
  button,
  buttons: buttonList,
  buttonLayout = 'row',
  roundness,
  exiting = false,
  autoExpandDelayMs,
  autoCollapseDelayMs,
  canExpand,
  refreshKey,
  onInteract,
  onDismiss,
}: SileoProps) {
  /* `buttons` wins; a lone `button` is the web shorthand for one of them */
  const buttons = useMemo(
    () => buttonList ?? (button ? [button] : undefined),
    [buttonList, button]
  );

  const next: ToastView = useMemo(
    () => ({ title, description, state, icon, styles, buttons, fill }),
    [title, description, state, icon, styles, buttons, fill]
  );

  const [view, setView] = useState<ToastView>(next);
  const [applied, setApplied] = useState(refreshKey);
  const [isExpanded, setIsExpanded] = useState(false);
  const [ready, setReady] = useState(false);
  const [pillWidth, setPillWidth] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const viewButtons = view.buttons ?? NO_BUTTONS;
  const hasDesc = Boolean(view.description) || viewButtons.length > 0;
  const isLoading = view.state === 'loading';
  const open = hasDesc && isExpanded && !isLoading;
  const allowExpand = isLoading ? false : (canExpand ?? true);

  const headerKey = `${view.state}-${view.title}`;
  const resolvedRoundness = Math.max(0, roundness ?? theme.roundness);
  const blur = resolvedRoundness * BLUR_RATIO;
  const isGlass = appearance === 'glass' && glass !== null;
  const tone = theme.stateColors[view.state];
  const text = isGlass ? theme.glass.description : theme.description;

  const autoExpandRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCollapseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRefreshKeyRef = useRef(refreshKey);
  const pendingRef = useRef<{ key?: string; payload: ToastView } | null>(null);

  /* ------------------------------ Measurements ------------------------------ */

  const handleHeaderMeasure = useCallback((inner: number) => {
    const w = Math.ceil(inner) + HEADER_PADDING * 2 + PILL_PADDING;
    if (w > PILL_PADDING) {
      setPillWidth((prev) => (prev === w ? prev : w));
    }
  }, []);

  const handleContentLayout = useCallback((e: LayoutChangeEvent) => {
    const h = Math.ceil(e.nativeEvent.layout.height);
    setContentHeight((prev) => (prev === h ? prev : h));
  }, []);

  useEffect(() => {
    if (!hasDesc) setContentHeight(0);
  }, [hasDesc]);

  /*
   * The web build marks the toast ready on the first animation frame, so the
   * first width lands without a spring. Here the first width only exists
   * once the header has been laid out, so wait for that and then a frame.
   */
  useEffect(() => {
    if (ready || pillWidth === 0) return;
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, [ready, pillWidth]);

  /* ----------------------------- Sync fill ---------------------------------- */

  useEffect(() => {
    setView((prev) => (prev.fill === fill ? prev : { ...prev, fill }));
  }, [fill]);

  /* ----------------------------- Refresh logic ------------------------------ */

  useEffect(() => {
    if (refreshKey === undefined) {
      setView(next);
      setApplied(undefined);
      pendingRef.current = null;
      lastRefreshKeyRef.current = refreshKey;
      return;
    }

    if (lastRefreshKeyRef.current === refreshKey) return;
    lastRefreshKeyRef.current = refreshKey;

    if (swapTimerRef.current) {
      clearTimeout(swapTimerRef.current);
      swapTimerRef.current = null;
    }

    if (open) {
      pendingRef.current = { key: refreshKey, payload: next };
      setIsExpanded(false);
      swapTimerRef.current = setTimeout(() => {
        swapTimerRef.current = null;
        const pending = pendingRef.current;
        if (!pending) return;
        setView(pending.payload);
        setApplied(pending.key);
        pendingRef.current = null;
      }, SWAP_COLLAPSE_MS);
    } else {
      pendingRef.current = null;
      setView(next);
      setApplied(refreshKey);
    }
  }, [open, refreshKey, next]);

  useEffect(
    () => () => {
      if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    },
    []
  );

  /* --------------------------- Interaction state ---------------------------- */

  /*
   * Whether a person opened this toast. While they have it open the Toaster
   * holds every dismiss timer, so it has to hear when that ends, including
   * when the toast ends first: swiped away, dismissed from code, or replaced
   * by the next toast under the same id.
   */
  const userOpenRef = useRef(false);
  const onInteractRef = useRef(onInteract);
  onInteractRef.current = onInteract;

  const release = useCallback(() => {
    if (!userOpenRef.current) return;
    userOpenRef.current = false;
    onInteractRef.current?.(false);
  }, []);

  useEffect(() => {
    if (exiting) release();
  }, [exiting, release]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: applied marks a new toast under this id
  useEffect(() => {
    release();
  }, [applied, release]);

  useEffect(() => release, [release]);

  /* ----------------------------- Auto expand/collapse ----------------------- */

  // biome-ignore lint/correctness/useExhaustiveDependencies: applied is used to force a re-run
  useEffect(() => {
    if (!hasDesc) return;

    if (autoExpandRef.current) clearTimeout(autoExpandRef.current);
    if (autoCollapseRef.current) clearTimeout(autoCollapseRef.current);

    if (exiting || !allowExpand) {
      setIsExpanded(false);
      return;
    }

    if (autoExpandDelayMs == null && autoCollapseDelayMs == null) return;

    const expandDelay = autoExpandDelayMs ?? 0;
    const collapseDelay = autoCollapseDelayMs ?? 0;

    if (expandDelay > 0) {
      autoExpandRef.current = setTimeout(
        () => setIsExpanded(true),
        expandDelay
      );
    } else {
      setIsExpanded(true);
    }

    if (collapseDelay > 0) {
      autoCollapseRef.current = setTimeout(
        () => setIsExpanded(false),
        collapseDelay
      );
    }

    return () => {
      if (autoExpandRef.current) clearTimeout(autoExpandRef.current);
      if (autoCollapseRef.current) clearTimeout(autoCollapseRef.current);
    };
  }, [
    autoCollapseDelayMs,
    autoExpandDelayMs,
    hasDesc,
    allowExpand,
    exiting,
    applied,
  ]);

  /* ------------------------------ Derived values ---------------------------- */

  const minExpanded = HEIGHT * MIN_EXPAND_RATIO;
  const rawExpanded = hasDesc
    ? Math.max(minExpanded, HEIGHT + contentHeight)
    : minExpanded;

  const frozenExpandedRef = useRef(rawExpanded);
  if (open) {
    frozenExpandedRef.current = rawExpanded;
  }

  const expanded = open ? rawExpanded : frozenExpandedRef.current;
  const svgHeight = hasDesc ? Math.max(expanded, minExpanded) : HEIGHT;
  const expandedContent = Math.max(0, expanded - HEIGHT);
  const resolvedPillWidth = Math.min(
    Math.max(pillWidth || HEIGHT, HEIGHT),
    width
  );
  const pillHeight = HEIGHT + blur * 3;

  const pillX =
    position === 'right'
      ? width - resolvedPillWidth
      : position === 'center'
        ? (width - resolvedPillWidth) / 2
        : 0;

  /* ------------------------------ Shared values ----------------------------- */

  const pillXv = useSharedValue(pillX);
  const pillWv = useSharedValue(resolvedPillWidth);
  const pillHv = useSharedValue(HEIGHT);
  const bodyHv = useSharedValue(0);
  const bodyOv = useSharedValue(0);
  const heightV = useSharedValue(HEIGHT);
  const openV = useSharedValue(0);
  const contentO = useSharedValue(0);
  const presence = useSharedValue(0);
  const swipe = useSharedValue(0);

  /*
   * Everything below lands without a spring until the toast is ready, which
   * is the web `pillTransition` / `data-ready` gate.
   */
  useEffect(() => {
    if (!ready) {
      pillXv.value = pillX;
      pillWv.value = resolvedPillWidth;
      return;
    }
    pillXv.value = withSpring(pillX, SPRING);
    pillWv.value = withSpring(resolvedPillWidth, SPRING);
  }, [ready, pillX, resolvedPillWidth, pillXv, pillWv]);

  useEffect(() => {
    const h = open ? pillHeight : HEIGHT;
    const o = open ? 1 : 0;
    const container = open ? expanded : HEIGHT;
    if (!ready) {
      pillHv.value = h;
      openV.value = o;
      heightV.value = container;
      return;
    }
    pillHv.value = withSpring(h, SPRING);
    openV.value = withSpring(o, SPRING);
    heightV.value = withSpring(container, SPRING);
  }, [ready, open, pillHeight, expanded, pillHv, openV, heightV]);

  useEffect(() => {
    const cfg = open ? SPRING : SPRING_NO_BOUNCE;
    bodyHv.value = withSpring(open ? expandedContent : 0, cfg);
    bodyOv.value = withSpring(open ? 1 : 0, cfg);
  }, [open, expandedContent, bodyHv, bodyOv]);

  useEffect(() => {
    contentO.value = open
      ? withDelay(
          DURATION_MS * 0.3,
          withTiming(1, { duration: DURATION_MS * 0.6, easing: EASE })
        )
      : withDelay(
          DURATION_MS * 0.04,
          withTiming(0, { duration: DURATION_MS * 0.08, easing: EASE })
        );
  }, [open, contentO]);

  useEffect(() => {
    presence.value = withSpring(ready && !exiting ? 1 : 0, SPRING_FAST);
  }, [ready, exiting, presence]);

  /* ------------------------------- Animated styles -------------------------- */

  /* toasts at the top come in from above, toasts at the bottom from below */
  const enterOffset = expand === 'bottom' ? -6 : 6;
  const headerOffset = expand === 'bottom' ? 3 : -3;

  /*
   * Glass does not draw under a parent with opacity below 1, so a glass toast
   * fades its text instead of itself and leaves the surface to its effect.
   */
  const containerStyle = useAnimatedStyle(() => ({
    height: heightV.value,
    opacity: isGlass ? 1 : presence.value,
    transform: [
      { translateY: (1 - presence.value) * enterOffset + swipe.value },
      { scale: 0.95 + 0.05 * presence.value },
    ],
  }));

  const headerStyle = useAnimatedStyle(() => ({
    left: pillXv.value,
    width: Math.max(0, pillWv.value - PILL_PADDING),
    opacity: isGlass ? presence.value : 1,
    transform: [
      { translateY: openV.value * headerOffset },
      { scale: 1 - 0.1 * openV.value },
    ],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentO.value * (isGlass ? presence.value : 1),
  }));

  /* -------------------------------- Handlers -------------------------------- */

  const clearAutopilot = useCallback(() => {
    if (autoExpandRef.current) clearTimeout(autoExpandRef.current);
    if (autoCollapseRef.current) clearTimeout(autoCollapseRef.current);
    autoExpandRef.current = null;
    autoCollapseRef.current = null;
  }, []);

  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  /*
   * The web toast opens on hover and closes when the pointer leaves, and
   * hovering holds the dismiss timers. A touch screen has no hover, so a tap
   * stands in for both: the first opens and holds, the next closes and lets
   * the timers run again. A tap also takes over from autopilot, which would
   * otherwise close the toast while it is being read.
   */
  const toggle = () => {
    if (exiting || !hasDesc || isLoading) return;
    clearAutopilot();
    if (open) {
      setIsExpanded(false);
      release();
      return;
    }
    if (!userOpenRef.current) {
      userOpenRef.current = true;
      onInteractRef.current?.(true);
    }
    setIsExpanded(true);
  };

  const pressButton = (index: number) => {
    const pressed = viewButtons[index];
    if (!pressed) return;
    (pressed.onPress ?? pressed.onClick)?.();
    if (pressed.dismiss) onDismissRef.current?.();
  };

  /*
   * Gestures hold these through refs so they are built once rather than on
   * every render: each button's tap is tied to the toast's tap, and
   * rebuilding one would rebuild them all.
   */
  const toggleRef = useRef(toggle);
  toggleRef.current = toggle;
  const pressButtonRef = useRef(pressButton);
  pressButtonRef.current = pressButton;
  const handleTap = useCallback(() => toggleRef.current(), []);
  const handleButtonPress = useCallback(
    (index: number) => pressButtonRef.current(index),
    []
  );
  const handleDismiss = useCallback(() => onDismissRef.current?.(), []);

  /* -------------------------------- Gestures -------------------------------- */

  const canSwipe = !exiting && Boolean(onDismiss);

  const tap = useMemo(
    () =>
      Gesture.Tap()
        .enabled(!exiting)
        .onEnd((_e, success) => {
          if (success) scheduleOnRN(handleTap);
        }),
    [exiting, handleTap]
  );

  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .enabled(canSwipe)
      .activeOffsetY([-8, 8])
      .failOffsetX([-20, 20])
      .onUpdate((e) => {
        const dy = e.translationY;
        // the web clamps the drag hard at SWIPE_MAX; a soft limit reads
        // better under a finger
        swipe.value =
          Math.sign(dy) * SWIPE_MAX * Math.tanh(Math.abs(dy) / SWIPE_MAX);
      })
      .onEnd((e) => {
        if (
          Math.abs(e.translationY) > SWIPE_DISMISS ||
          Math.abs(e.velocityY) > SWIPE_VELOCITY
        ) {
          scheduleOnRN(handleDismiss);
        }
      })
      .onFinalize(() => {
        swipe.value = withSpring(0, SPRING_FAST);
      });

    return Gesture.Exclusive(pan, tap);
  }, [canSwipe, swipe, handleDismiss, tap]);

  /* ------------------------------ Accessibility ----------------------------- */

  const label = [
    view.title,
    typeof view.description === 'string' ? view.description : undefined,
  ]
    .filter(Boolean)
    .join('. ');

  /* Android reads the viewport's live region; iOS has to be told */
  useEffect(() => {
    if (!ready || exiting || Platform.OS !== 'ios' || !label) return;
    AccessibilityInfo.announceForAccessibility(label);
  }, [ready, exiting, label]);

  const accessibilityActions = useMemo(() => {
    const actions: AccessibilityAction[] = [];
    if (hasDesc && !isLoading) {
      actions.push({ name: 'activate', label: open ? 'Collapse' : 'Expand' });
    }
    viewButtons.forEach((b, i) => {
      actions.push({
        name: `button-${i}`,
        label: b.accessibilityLabel ?? b.title,
      });
    });
    if (onDismiss) actions.push({ name: 'escape', label: 'Dismiss' });
    return actions;
  }, [hasDesc, isLoading, open, viewButtons, onDismiss]);

  const handleAccessibilityAction = useCallback(
    (e: AccessibilityActionEvent) => {
      const name = e.nativeEvent.actionName;
      if (name === 'activate') handleTap();
      else if (name === 'escape') handleDismiss();
      else if (name.startsWith('button-')) {
        handleButtonPress(Number(name.slice('button-'.length)));
      }
    },
    [handleTap, handleButtonPress, handleDismiss]
  );

  /* ---------------------------------- Theme --------------------------------- */

  const toastTheme = useMemo(
    () => ({
      ...theme,
      fill: view.fill,
      state: view.state,
      tone,
      appearance,
      text,
    }),
    [theme, view.fill, view.state, tone, appearance, text]
  );

  const buttonTone = (b: SileoButton) =>
    b.variant === 'neutral' ? text : theme.stateColors[b.variant ?? view.state];

  /* --------------------------------- Render --------------------------------- */

  return (
    <SileoThemeContext.Provider value={toastTheme}>
      <GestureDetector gesture={gesture}>
        <Animated.View
          pointerEvents={exiting ? 'none' : 'auto'}
          accessible
          accessibilityRole="alert"
          accessibilityLabel={label}
          accessibilityState={{ expanded: open, busy: isLoading }}
          accessibilityActions={accessibilityActions}
          onAccessibilityAction={handleAccessibilityAction}
          style={[{ width }, s.toast, containerStyle]}
        >
          {isGlass && glass ? (
            <GlassSurface
              glass={glass}
              theme={theme.glass}
              width={width}
              roundness={resolvedRoundness}
              flip={expand === 'top'}
              visible={ready && !exiting}
              open={open}
              content={expandedContent}
              pillX={pillXv}
              pillW={pillWv}
              pillH={pillHv}
              bodyH={bodyHv}
            />
          ) : (
            <GooeyCanvas
              width={width}
              height={svgHeight}
              fill={view.fill}
              roundness={resolvedRoundness}
              blur={blur}
              flip={expand === 'top'}
              pillX={pillXv}
              pillW={pillWv}
              pillH={pillHv}
              bodyH={bodyHv}
              bodyO={bodyOv}
            />
          )}

          <Animated.View
            pointerEvents="none"
            style={[
              s.header,
              expand === 'top' ? s.atBottom : s.atTop,
              headerStyle,
            ]}
          >
            <Header
              layerKey={headerKey}
              state={view.state}
              title={view.title}
              icon={view.icon}
              styles={view.styles}
              tone={tone}
              titleColor={theme.title ?? tone}
              badgeBackground={withAlpha(tone, theme.tones.badge)}
              fontFamily={theme.fontFamily}
              width={width}
              onMeasure={handleHeaderMeasure}
            />
          </Animated.View>

          {hasDesc && (
            <Animated.View
              pointerEvents={open ? 'box-none' : 'none'}
              style={[
                s.content,
                expand === 'top' ? s.atTop : s.belowHeader,
                contentStyle,
              ]}
            >
              <View onLayout={handleContentLayout} style={s.description}>
                {typeof view.description === 'string' ? (
                  <Text
                    style={[
                      s.descriptionText,
                      { color: text, fontFamily: theme.fontFamily },
                      view.styles?.description,
                    ]}
                  >
                    {view.description}
                  </Text>
                ) : (
                  view.description
                )}
                {viewButtons.length > 0 && (
                  <View
                    style={[
                      buttonLayout === 'row' ? s.buttonRow : s.buttonColumn,
                      Boolean(view.description) && s.buttonsAfterText,
                    ]}
                  >
                    {viewButtons.map((b, i) => {
                      const color = buttonTone(b);
                      const neutral = b.variant === 'neutral';
                      return (
                        <ToastButton
                          // biome-ignore lint/suspicious/noArrayIndexKey: buttons have no identity beyond their slot
                          key={i}
                          button={b}
                          index={i}
                          color={color}
                          background={withAlpha(
                            neutral ? '#808080' : color,
                            theme.tones.button
                          )}
                          pressedBackground={withAlpha(
                            neutral ? '#808080' : color,
                            theme.tones.buttonPressed
                          )}
                          layout={buttonLayout}
                          fontFamily={theme.fontFamily}
                          styles={view.styles}
                          toastTap={tap}
                          onPress={handleButtonPress}
                        />
                      );
                    })}
                  </View>
                )}
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </GestureDetector>
    </SileoThemeContext.Provider>
  );
});

const s = StyleSheet.create({
  toast: {
    overflow: 'visible',
  },
  header: {
    position: 'absolute',
    zIndex: 20,
    height: HEIGHT,
    overflow: 'hidden',
  },
  atTop: {
    top: 0,
  },
  atBottom: {
    bottom: 0,
  },
  belowHeader: {
    top: HEIGHT,
  },
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  description: {
    padding: 16,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonColumn: {
    gap: 8,
  },
  buttonsAfterText: {
    marginTop: 12,
  },
});
