import { type ReactNode, useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';

interface IconProps {
  color: string;
}

const Icon = ({ color, children }: IconProps & { children: ReactNode }) => (
  <Svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </Svg>
);

export const ArrowRight = ({ color }: IconProps) => (
  <Icon color={color}>
    <Path d="M5 12h14" />
    <Path d="m12 5 7 7-7 7" />
  </Icon>
);

export const LifeBuoy = ({ color }: IconProps) => (
  <Icon color={color}>
    <Circle cx="12" cy="12" r="10" />
    <Path d="m4.93 4.93 4.24 4.24" />
    <Path d="m14.83 9.17 4.24-4.24" />
    <Path d="m14.83 14.83 4.24 4.24" />
    <Path d="m9.17 14.83-4.24 4.24" />
    <Circle cx="12" cy="12" r="4" />
  </Icon>
);

export const LoaderCircle = ({ color }: IconProps) => (
  <Icon color={color}>
    <Path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </Icon>
);

export const X = ({ color }: IconProps) => (
  <Icon color={color}>
    <Path d="M18 6 6 18" />
    <Path d="m6 6 12 12" />
  </Icon>
);

export const CircleAlert = ({ color }: IconProps) => (
  <Icon color={color}>
    <Circle cx="12" cy="12" r="10" />
    <Line x1="12" x2="12" y1="8" y2="12" />
    <Line x1="12" x2="12.01" y1="16" y2="16" />
  </Icon>
);

export const Check = ({ color }: IconProps) => (
  <Icon color={color}>
    <Path d="M20 6 9 17l-5-5" />
  </Icon>
);

/** `[data-sileo-icon="spin"]`: one turn a second, linear, forever */
export function Spinner({ color }: IconProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
    return () => cancelAnimation(rotation);
  }, [rotation]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={style}>
      <LoaderCircle color={color} />
    </Animated.View>
  );
}
