import {
  Blur,
  Canvas,
  ColorMatrix,
  Group,
  Paint,
  RoundedRect,
} from '@shopify/react-native-skia';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { HEIGHT, REGION_SIGMA } from './constants';

/*
 * The web filter, step for step:
 *
 *   feGaussianBlur stdDeviation={blur}
 *   feColorMatrix  alpha' = 20·alpha − 10
 *   feComposite    SourceGraphic atop goo
 *
 * The blur smears the pill and the body into each other and the alpha
 * threshold cuts that smear back to a hard edge, which is what grows the
 * fillet between them. Drawing the crisp shapes `srcATop` the result keeps
 * their edges wherever they are, as `feComposite atop` does.
 */
const GOO = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 20, -10];

interface GooeyCanvasProps {
  width: number;
  height: number;
  fill: string;
  roundness: number;
  blur: number;
  flip: boolean;
  pillX: SharedValue<number>;
  pillW: SharedValue<number>;
  pillH: SharedValue<number>;
  bodyH: SharedValue<number>;
  bodyO: SharedValue<number>;
}

export const GooeyCanvas = memo(function GooeyCanvas({
  width,
  height,
  fill,
  roundness,
  blur,
  flip,
  pillX,
  pillW,
  pillH,
  bodyH,
  bodyO,
}: GooeyCanvasProps) {
  /*
   * The web SVG overflows its box and the filter region carries a margin of
   * two sigmas so a spring overshooting the box is still drawn. A canvas
   * clips to its bounds, so it is sized with that margin built in and the
   * drawing is moved back by it.
   */
  const margin = Math.ceil(blur * REGION_SIGMA);

  const shapes = (
    <>
      <RoundedRect
        x={pillX}
        y={0}
        width={pillW}
        height={pillH}
        r={roundness}
        color={fill}
      />
      <RoundedRect
        x={0}
        y={HEIGHT}
        width={width}
        height={bodyH}
        r={roundness}
        color={fill}
        opacity={bodyO}
      />
    </>
  );

  return (
    <Canvas
      pointerEvents="none"
      // flattened: on the web Skia hands the style to a DOM element as is
      style={StyleSheet.flatten([
        s.canvas,
        flip ? { bottom: -margin } : { top: -margin },
        {
          left: -margin,
          width: width + margin * 2,
          height: height + margin * 2,
          transform: flip ? [{ scaleY: -1 }] : undefined,
        },
      ])}
    >
      <Group transform={[{ translateX: margin }, { translateY: margin }]}>
        {blur > 0 ? (
          <>
            <Group
              layer={
                <Paint>
                  <Blur blur={blur} />
                  <ColorMatrix matrix={GOO} />
                </Paint>
              }
            >
              {shapes}
            </Group>
            <Group blendMode="srcATop">{shapes}</Group>
          </>
        ) : (
          shapes
        )}
      </Group>
    </Canvas>
  );
});

const s = StyleSheet.create({
  canvas: {
    position: 'absolute',
  },
});
