import { type LayoutChangeEvent, Platform } from 'react-native';

interface WebElement {
  offsetWidth?: number;
  offsetHeight?: number;
}

/*
 * React Native reports a view's layout before transforms. react-native-web
 * reports its bounding box after them, so a toast measured while it is
 * scaled — entering at 0.95, or with the header at 0.9 while open — reads
 * small, and the pill is sized to the shrunken title. On the web, read the
 * element's own layout size, which transforms do not touch.
 */
export function layoutSize(e: LayoutChangeEvent, node: unknown) {
  const el = node as WebElement | null;
  if (
    Platform.OS === 'web' &&
    el &&
    typeof el.offsetWidth === 'number' &&
    typeof el.offsetHeight === 'number'
  ) {
    return { width: el.offsetWidth, height: el.offsetHeight };
  }
  return e.nativeEvent.layout;
}
