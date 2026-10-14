import {
  cloneElement,
  isValidElement,
  memo,
  type ReactElement,
  type ReactNode,
  useCallback,
} from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import {
  BADGE_SIZE,
  DURATION_MS,
  HEADER_EXIT_MS,
  HEADER_PADDING,
} from './constants';
import { ArrowRight, Check, CircleAlert, LifeBuoy, Spinner, X } from './icons';
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
 * `sileo-header-enter` / `sileo-header-exit`. The web layers also blur by 6px
 * on the way in and out; a view cannot be blurred on iOS, so this trades the
 * blur for a slight scale.
 */
const HeaderEnter = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.96 }] },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.out(Easing.cubic),
  },
}).duration(DURATION_MS);

const HeaderExit = new Keyframe({
  0: { opacity: 1, transform: [{ scale: 1 }] },
  100: {
    opacity: 0,
    transform: [{ scale: 0.96 }],
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
}).duration(HEADER_EXIT_MS);

interface HeaderProps {
  layerKey: string;
  state: SileoState;
  title?: string;
  icon?: ReactNode | null;
  styles?: SileoStyles;
  tone: string;
  titleColor: string;
  badgeBackground: string;
  fontFamily?: string;
  width: number;
  onMeasure: (width: number) => void;
}

export const Header = memo(function Header({
  layerKey,
  state,
  title,
  icon,
  styles,
  tone,
  titleColor,
  badgeBackground,
  fontFamily,
  width,
  onMeasure,
}: HeaderProps) {
  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => onMeasure(e.nativeEvent.layout.width),
    [onMeasure]
  );

  /*
   * The row sits in a holder as wide as the toast so it is measured at its
   * natural width. The header around it is clipped to the pill, and measuring
   * inside that clip would read back the pill's width rather than the
   * content's — the `scrollWidth` the web build reads.
   *
   * Keying the row by state and title replaces the web `prev` layer: the old
   * row plays its exit while the new one plays its entrance.
   */
  return (
    <View style={[s.holder, { width }]}>
      <Animated.View
        key={layerKey}
        entering={HeaderEnter}
        exiting={HeaderExit}
        onLayout={handleLayout}
        style={s.inner}
      >
        <View
          style={[s.badge, { backgroundColor: badgeBackground }, styles?.badge]}
        >
          {renderIcon(icon, state, tone)}
        </View>
        <Text
          numberOfLines={1}
          style={[s.title, { color: titleColor, fontFamily }, styles?.title]}
        >
          {title}
        </Text>
      </Animated.View>
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
