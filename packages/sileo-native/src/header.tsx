import {
  cloneElement,
  type ComponentRef,
  isValidElement,
  memo,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  BADGE_SIZE,
  DURATION_MS,
  HEADER_EXIT_MS,
  HEADER_PADDING,
} from './constants';
import { ArrowRight, Check, CircleAlert, LifeBuoy, Spinner, X } from './icons';
import { layoutSize } from './measure';
import type { SileoState, SileoStyles } from './types';

const STATE_ICON: Record<SileoState, (color: string) => ReactNode> = {
  success: (c) => <Check color={c} />,
  loading: (c) => <Spinner color={c} />,
  error: (c) => <X color={c} />,
  warning: (c) => <CircleAlert color={c} />,
  info: (c) => <LifeBuoy color={c} />,
  action: (c) => <ArrowRight color={c} />,
};

/*
 * The web badge sets `color` and lets the icon pick it up as `currentColor`.
 * Nothing inherits a color on native, so hand the tone to a custom icon that
 * did not choose one. Icon sets for React Native take `color`.
 */
const renderIcon = (
  icon: ReactNode | null | undefined,
  state: SileoState,
  tone: string
) => {
  if (icon === undefined || icon === null) return STATE_ICON[state](tone);
  if (
    isValidElement<{ color?: string }>(icon) &&
    icon.props.color === undefined
  ) {
    return cloneElement(icon as ReactElement<{ color?: string }>, {
      color: tone,
    });
  }
  return icon;
};

/*
 * `sileo-header-enter` / `sileo-header-exit`, ported as the web build does
 * it: the new row and the outgoing one are both on screen while they cross.
 * The web rows also blur by 6px; a view cannot be blurred on iOS, so this
 * trades the blur for a slight scale.
 *
 * Plain shared values rather than Reanimated's layout animations, which on
 * the web pin the row to the size it had when the animation started — and a
 * row that started inside the scaled-down header stays squeezed.
 */
const EASE_OUT = Easing.out(Easing.cubic);
const EASE = Easing.bezier(0.25, 0.1, 0.25, 1);

interface LayerData {
  state: SileoState;
  title?: string;
  icon?: ReactNode | null;
  styles?: SileoStyles;
  tone: string;
  titleColor: string;
  badgeBackground: string;
  fontFamily?: string;
}

const HeaderLayer = memo(function HeaderLayer({
  data,
  leaving = false,
  onMeasure,
}: {
  data: LayerData;
  leaving?: boolean;
  onMeasure?: (width: number) => void;
}) {
  const ref = useRef<ComponentRef<typeof View>>(null);
  const progress = useSharedValue(leaving ? 1 : 0);

  useEffect(() => {
    progress.value = leaving
      ? withTiming(0, { duration: HEADER_EXIT_MS, easing: EASE })
      : withTiming(1, { duration: DURATION_MS, easing: EASE_OUT });
  }, [leaving, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.96 + 0.04 * progress.value }],
  }));

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => onMeasure?.(layoutSize(e, ref.current).width),
    [onMeasure]
  );

  const { state, title, icon, styles, tone, titleColor, badgeBackground } =
    data;

  return (
    <Animated.View
      ref={ref}
      onLayout={onMeasure ? handleLayout : undefined}
      pointerEvents="none"
      style={[s.inner, leaving && s.leaving, style]}
    >
      <View
        style={[s.badge, { backgroundColor: badgeBackground }, styles?.badge]}
      >
        {renderIcon(icon, state, tone)}
      </View>
      <Text
        numberOfLines={1}
        style={[
          s.title,
          { color: titleColor, fontFamily: data.fontFamily },
          styles?.title,
        ]}
      >
        {title}
      </Text>
    </Animated.View>
  );
});

interface HeaderProps extends LayerData {
  layerKey: string;
  width: number;
  onMeasure: (width: number) => void;
}

export const Header = memo(function Header({
  layerKey,
  width,
  onMeasure,
  ...data
}: HeaderProps) {
  /* the row on its way out, kept for as long as its exit runs */
  const [prev, setPrev] = useState<{ key: string; data: LayerData } | null>(
    null
  );
  const lastRef = useRef({ key: layerKey, data });

  /* runs first: lastRef still holds the row from the previous commit */
  useLayoutEffect(() => {
    if (lastRef.current.key !== layerKey) setPrev(lastRef.current);
  }, [layerKey]);

  useLayoutEffect(() => {
    lastRef.current = { key: layerKey, data };
  });

  useEffect(() => {
    if (!prev) return;
    const timer = setTimeout(() => setPrev(null), HEADER_EXIT_MS);
    return () => clearTimeout(timer);
  }, [prev]);

  /*
   * The rows sit in a holder as wide as the toast so the current one is
   * measured at its natural width. The header around it is clipped to the
   * pill, and measuring inside that clip would read back the pill's width
   * rather than the content's — the `scrollWidth` the web build reads.
   */
  return (
    <View style={[s.holder, { width }]}>
      <HeaderLayer key={layerKey} data={data} onMeasure={onMeasure} />
      {prev && prev.key !== layerKey && (
        <HeaderLayer key={`prev-${prev.key}`} data={prev.data} leaving />
      )}
    </View>
  );
});

const s = StyleSheet.create({
  holder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HEADER_PADDING,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leaving: {
    position: 'absolute',
    left: HEADER_PADDING,
    top: 0,
    bottom: 0,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    padding: 2,
    borderRadius: BADGE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 13.2,
    lineHeight: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});
