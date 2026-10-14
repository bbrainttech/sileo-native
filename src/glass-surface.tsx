import { type ComponentType, memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  type AnimatedProps,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { HEIGHT } from './constants';
import type { GlassModule, GlassViewProps } from './glass-registry';
import type { SileoGlassTheme } from './theme';

/*
 * The glass counterpart of the gooey canvas. Two glass views — the pill and
 * the card — inside one GlassContainer, which melts glass shapes into each
 * other as they meet. That is the gooey fillet, done by the system: the pill
 * reaches down into the card while it is open, exactly as it does on the
 * canvas, and the container merges them.
 *
 * Glass does not draw under a parent with opacity below 1, so the surface
 * never fades. It appears and disappears through its effect style, which the
 * system animates.
 */

type AnimatedGlassView = ComponentType<AnimatedProps<GlassViewProps>>;

const animated = new WeakMap<
  ComponentType<GlassViewProps>,
  AnimatedGlassView
>();

const getAnimatedGlassView = (GlassView: ComponentType<GlassViewProps>) => {
  let component = animated.get(GlassView);
  if (!component) {
    component = Animated.createAnimatedComponent(
      GlassView
    ) as unknown as AnimatedGlassView;
    animated.set(GlassView, component);
  }
  return component;
};

interface GlassSurfaceProps {
  glass: GlassModule;
  theme: SileoGlassTheme;
  width: number;
  roundness: number;
  flip: boolean;
  visible: boolean;
  open: boolean;
  /** the card's height when fully open */
  content: number;
  pillX: SharedValue<number>;
  pillW: SharedValue<number>;
  pillH: SharedValue<number>;
  bodyH: SharedValue<number>;
}

export const GlassSurface = memo(function GlassSurface({
  glass,
  theme,
  width,
  roundness,
  flip,
  visible,
  open,
  content,
  pillX,
  pillW,
  pillH,
  bodyH,
}: GlassSurfaceProps) {
  const AnimatedGlassView = useMemo(
    () => getAnimatedGlassView(glass.GlassView),
    [glass.GlassView]
  );

  const pillStyle = useAnimatedStyle(() => ({
    left: pillX.value,
    width: pillW.value,
    height: pillH.value,
  }));

  /*
   * On the canvas the card never shows as a sliver: the blur and threshold
   * erase anything thinner than the blur, so the card seems to grow out of
   * the pill. Glass has no threshold, and a full-width card a few points
   * tall shows as a bar with corners under the pill before it fills in. So
   * the card starts as the pill's footprint and stays that wide until it is
   * a corner radius tall, so it reads as the pill stretching down. Then it
   * spreads to full width, reaching it a little before full height, as the
   * goo does.
   */
  const bodyStyle = useAnimatedStyle(() => {
    const h = Math.max(0, bodyH.value);
    const grown = Math.max(0, h - roundness);
    const spread = Math.min(
      1,
      (1.6 * grown) / Math.max(1, content - roundness)
    );
    return {
      left: pillX.value * (1 - spread),
      width: pillW.value + (width - pillW.value) * spread,
      height: h,
    };
  });

  const pillEffect = {
    style: visible ? theme.style : ('none' as const),
    animate: true,
    animationDuration: 0.35,
  };
  const bodyEffect = {
    style: visible && open ? theme.style : ('none' as const),
    animate: true,
    animationDuration: 0.35,
  };

  return (
    <glass.GlassContainer
      pointerEvents="none"
      spacing={roundness}
      style={StyleSheet.absoluteFill}
    >
      <AnimatedGlassView
        glassEffectStyle={pillEffect}
        tintColor={theme.tint}
        colorScheme={theme.colorScheme}
        style={[
          s.shape,
          { borderRadius: roundness },
          flip ? s.bottom : s.top,
          pillStyle,
        ]}
      />
      <AnimatedGlassView
        glassEffectStyle={bodyEffect}
        tintColor={theme.tint}
        colorScheme={theme.colorScheme}
        style={[
          s.shape,
          { borderRadius: roundness },
          flip ? s.aboveHeader : s.belowHeader,
          bodyStyle,
        ]}
      />
    </glass.GlassContainer>
  );
});

const s = StyleSheet.create({
  shape: {
    position: 'absolute',
    overflow: 'hidden',
  },
  top: { top: 0 },
  bottom: { bottom: 0 },
  belowHeader: { top: HEIGHT },
  aboveHeader: { bottom: HEIGHT },
});
