import { processColor } from 'react-native';

/**
 * `color-mix(in oklch, <color> N%, transparent)` from the web stylesheet,
 * which for a mix with transparent is the color at N% of its alpha.
 *
 * Takes any color React Native can parse: names, hex, `rgb()`, `hsl()`.
 * A platform color cannot be mixed and comes back as given.
 */
export function withAlpha(color: string, alpha: number): string {
  /* eslint-disable no-bitwise -- unpacking an ARGB integer */
  const processed = processColor(color);
  if (typeof processed !== 'number') return color;
  const argb = processed >>> 0;
  const a = ((argb >>> 24) & 0xff) / 255;
  const r = (argb >>> 16) & 0xff;
  const g = (argb >>> 8) & 0xff;
  const b = argb & 0xff;
  /* eslint-enable no-bitwise */
  const mixed = Math.round(a * Math.min(1, Math.max(0, alpha)) * 1000) / 1000;
  return `rgba(${r}, ${g}, ${b}, ${mixed})`;
}
