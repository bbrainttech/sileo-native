/**
 * Liquid Glass for sileo-native. Import once, anywhere in the app:
 *
 * ```ts
 * import 'sileo-native/glass';
 * ```
 *
 * then set `appearance="glass"` on the Toaster or on a toast. Requires
 * `expo-glass-effect`. Draws on iOS 26 and later; elsewhere toasts stay solid.
 */
import {
  GlassContainer,
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { Platform } from 'react-native';
import { registerGlass } from './glass-registry';

const isAvailable = (() => {
  if (Platform.OS !== 'ios') return false;
  try {
    // some iOS 26 betas report Liquid Glass without the API behind it
    return isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
  } catch {
    return false;
  }
})();

registerGlass({ GlassView, GlassContainer, isAvailable });
