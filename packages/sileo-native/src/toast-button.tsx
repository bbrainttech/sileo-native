import { memo, useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  Gesture,
  GestureDetector,
  type GestureType,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import type { SileoButton, SileoStyles } from './types';

interface ToastButtonProps {
  button: SileoButton;
  index: number;
  color: string;
  background: string;
  pressedBackground: string;
  layout: 'row' | 'column';
  fontFamily?: string;
  styles?: SileoStyles;
  /** the toast's own tap, which waits for this one to fail */
  toastTap: GestureType;
  onPress: (index: number) => void;
}

/*
 * The web button is an `<a>` inside the toast's `<button>`, stopping the
 * click from reaching it. Here the button's tap blocks the toast's tap, so
 * pressing a button does not also open or close the card.
 */
export const ToastButton = memo(function ToastButton({
  button,
  index,
  color,
  background,
  pressedBackground,
  layout,
  fontFamily,
  styles,
  toastTap,
  onPress,
}: ToastButtonProps) {
  const pressed = useSharedValue(0);

  const tap = useMemo(
    () =>
      Gesture.Tap()
        .blocksExternalGesture(toastTap)
        .onBegin(() => {
          pressed.value = 1;
        })
        .onEnd((_e, success) => {
          if (success) scheduleOnRN(onPress, index);
        })
        .onFinalize(() => {
          pressed.value = 0;
        }),
    [toastTap, pressed, onPress, index]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: pressed.value ? pressedBackground : background,
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        accessible={false}
        style={[
          s.button,
          layout === 'row' && s.row,
          animatedStyle,
          styles?.button,
          button.style,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            s.text,
            { color, fontFamily },
            styles?.buttonText,
            button.textStyle,
          ]}
        >
          {button.title}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
});

const s = StyleSheet.create({
  button: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flex: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
