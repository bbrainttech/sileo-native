import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

/** The variants a toast can be fired as. */
export type SileoVariant = 'success' | 'error' | 'warning' | 'info' | 'action';

/** Every state a toast can be in: a variant, or `loading` while a promise is pending. */
export type SileoState = SileoVariant | 'loading';

/**
 * How the toast surface is drawn.
 *
 * - `solid` — the gooey morph in a flat fill, drawn with Skia. The default.
 * - `glass` — iOS 26 Liquid Glass. Needs `import 'sileo-native/glass'` once in
 *   your app; falls back to `solid` on Android, older iOS, and when Reduce
 *   Transparency is on.
 */
export type SileoAppearance = 'solid' | 'glass';

/**
 * Style overrides for the toast's sub-elements.
 *
 * The web build takes class names here; on native these are style objects.
 * `description` styles the text when the description is a string. A node
 * description is rendered as given; read the toast's colors in it with
 * `useSileoTheme()`.
 */
export interface SileoStyles {
  title?: StyleProp<TextStyle>;
  description?: StyleProp<TextStyle>;
  badge?: StyleProp<ViewStyle>;
  /** every button in the toast; a button's own `style` goes on top */
  button?: StyleProp<ViewStyle>;
  /** every button label in the toast; a button's own `textStyle` goes on top */
  buttonText?: StyleProp<TextStyle>;
}

interface SileoButtonBase {
  /** The label. */
  title: string;
  /**
   * Color the button with a variant's color. Defaults to the toast's own
   * state; `neutral` uses the description color.
   */
  variant?: SileoVariant | 'neutral';
  /** Dismiss the toast once the button has been pressed. Defaults to `false`. */
  dismiss?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** Read by screen readers instead of `title`. */
  accessibilityLabel?: string;
}

/**
 * A button in the toast's card. Takes `onPress`, or `onClick` as on the web —
 * one of the two, not both.
 */
export type SileoButton = SileoButtonBase &
  (
    | { onPress: () => void; onClick?: never }
    | {
        /** The web name for `onPress`, kept so web code ports unchanged. */
        onClick: () => void;
        onPress?: never;
      }
  );

/** One to four buttons. */
export type SileoButtons =
  | readonly [SileoButton]
  | readonly [SileoButton, SileoButton]
  | readonly [SileoButton, SileoButton, SileoButton]
  | readonly [SileoButton, SileoButton, SileoButton, SileoButton];

export const SILEO_POSITIONS = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const;

export type SileoPosition = (typeof SILEO_POSITIONS)[number];

export interface SileoAutopilot {
  /** ms after showing before the card opens */
  expand?: number;
  /** ms after showing before the card closes again */
  collapse?: number;
}

export interface SileoOptions {
  /** The heading. Defaults to the state's name. */
  title?: string;
  /** The card's body. A string is wrapped in `Text`; any node is rendered as given. */
  description?: ReactNode;
  /** The state for `sileo.show()`. The shortcuts set it for you. */
  type?: SileoState;
  /** Override the Toaster's position for this toast. */
  position?: SileoPosition;
  /** Auto-dismiss after this many ms. `null` keeps the toast until dismissed. Defaults to `6000`. */
  duration?: number | null;
  /** Replace the state icon. An element without a `color` prop is given the state color. */
  icon?: ReactNode | null;
  styles?: SileoStyles;
  /** The surface color, for the `solid` appearance. Overrides the theme. */
  fill?: string;
  /** Corner radius; also sets the gooey blur. Overrides the theme. Defaults to `16`. */
  roundness?: number;
  /** Overrides the Toaster's appearance for this toast. */
  appearance?: SileoAppearance;
  /** Open and close the card on a timer. `false` leaves it to the reader. Defaults to `true`. */
  autopilot?: boolean | SileoAutopilot;
  /** A single button, as on the web. `buttons` wins when both are given. */
  button?: SileoButton;
  /** Up to four buttons. */
  buttons?: SileoButtons;
  /** Lay the buttons out side by side (`row`, the default) or stacked (`column`). */
  buttonLayout?: 'row' | 'column';
}
