/* --------------------------------- Layout --------------------------------- */

export const HEIGHT = 40;
export const WIDTH = 350;
export const DEFAULT_ROUNDNESS = 16;

export const VIEWPORT_PADDING = 12;
export const VIEWPORT_GAP = 12;
export const HEADER_PADDING = 8;
export const BADGE_SIZE = 24;

/* --------------------------------- Timing --------------------------------- */

export const DURATION_MS = 600;

export const DEFAULT_TOAST_DURATION = 6000;
export const EXIT_DURATION = DEFAULT_TOAST_DURATION * 0.1;
export const AUTO_EXPAND_DELAY = DEFAULT_TOAST_DURATION * 0.025;
export const AUTO_COLLAPSE_DELAY = DEFAULT_TOAST_DURATION - 2000;

/*
 * The web build runs one spring, `{ bounce: 0.25, duration: 0.6 }`, through
 * motion for the shapes and a `linear()` approximation of it through CSS for
 * everything else. Here both are the same Reanimated spring: a bounce of 0.25
 * is a damping ratio of 0.75.
 */
export const SPRING = {
  duration: DURATION_MS,
  dampingRatio: 0.75,
} as const;

export const SPRING_NO_BOUNCE = {
  duration: DURATION_MS,
  dampingRatio: 1,
} as const;

/** the CSS transitions on transform, opacity and margin run at 0.66× */
export const SPRING_FAST = {
  duration: DURATION_MS * 0.66,
  dampingRatio: 0.75,
} as const;

/* --------------------------------- Render --------------------------------- */

export const BLUR_RATIO = 0.5;
export const PILL_PADDING = 10;
export const MIN_EXPAND_RATIO = 2.25;
export const SWAP_COLLAPSE_MS = 200;
export const HEADER_EXIT_MS = DURATION_MS * 0.7;
export const REGION_SIGMA = 2;

/* --------------------------------- Gesture -------------------------------- */

export const SWIPE_DISMISS = 30;
export const SWIPE_MAX = 20;
