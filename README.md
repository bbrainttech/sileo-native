# sileo-native

An opinionated, physics-based toast library for React Native and Expo, ported from [sileo](https://github.com/hiaaryan/sileo) for the web.

It has the same API and the same gooey pill-to-card morph. The morph is drawn with Skia and animated on the UI thread with Reanimated. On iOS 26 it can also be drawn in Liquid Glass.

## Installation

```sh
npx expo install sileo-native @shopify/react-native-skia react-native-reanimated react-native-worklets react-native-gesture-handler react-native-svg react-native-safe-area-context
```

All of the peer dependencies ship in Expo Go, so no development build is needed. Reanimated 4 requires the New Architecture, which is the default from Expo SDK 52 onward.

## Getting started

Render a `Toaster` once, after your app, inside your providers:

```tsx
import { sileo, Toaster } from 'sileo-native';

export default function App() {
  return (
    <>
      <YourApp />
      <Toaster position="top-center" theme="system" />
    </>
  );
}
```

Then fire toasts from anywhere:

```tsx
sileo.success({ title: 'Changes Saved', description: 'Your profile is up to date.' });
```

If your app has a `SafeAreaProvider` (Expo Router adds one), toasts sit below the notch and above the home indicator. Without one they sit 12pt from the screen edge.

Like the web version, every toast shares one id, so a new toast does not stack. It morphs the visible one into the new content.

## Buttons

Up to four buttons, each colored by a variant:

```tsx
sileo.warning({
  title: 'Unsaved Changes',
  description: 'You have edits that have not been saved yet.',
  buttons: [
    { title: 'Save', variant: 'success', dismiss: true, onPress: save },
    { title: 'Discard', variant: 'error', dismiss: true, onPress: discard },
  ],
});
```

- `variant` is one of `success`, `error`, `warning`, `info`, `action`, or `neutral`. It defaults to the toast's own state.
- `dismiss: true` closes the toast after the press.
- `style` and `textStyle` restyle one button; `styles.button` and `styles.buttonText` restyle all of them.
- `buttonLayout: 'column'` stacks them instead of laying them side by side.
- The types allow one to four buttons, and `onPress` or `onClick` but not both.

The web shape still works: `button: { title, onClick }`.

## Themes

```tsx
<Toaster theme="system" />                      // light / dark / system
<Toaster theme={{ fill: '#2e1065' }} />         // overrides on the default
<Toaster
  theme={{                                      // overrides per scheme
    light: { fill: '#2e1065', stateColors: { success: '#4ade80' } },
    dark: { fill: '#ede9fe' },
  }}
/>
```

The theme names describe the app, as on the web: `light` gives a dark toast that stands off a light app, and `dark` gives a light one. Without a `theme`, toasts are white.

A theme sets `fill`, `description`, `title`, `stateColors`, `tones` (badge and button opacity), `roundness`, `appearance`, `glass`, and `fontFamily`. Build one in code with `createTheme(overrides, base)`. The built-ins are exported as `defaultTheme` and `themes.light` / `themes.dark`.

Nothing inherits a color on native, so custom descriptions read the toast's colors from `useSileoTheme()`:

```tsx
function Paid() {
  const { tone, text } = useSileoTheme();
  return (
    <Text style={{ color: text }}>
      Received <Text style={{ color: tone }}>$49.00</Text>
    </Text>
  );
}

sileo.success({ title: 'Payment received', description: <Paid /> });
```

## Liquid Glass (iOS 26)

```sh
npx expo install expo-glass-effect
```

```tsx
import 'sileo-native/glass'; // once, anywhere

<Toaster appearance="glass" />;                  // every toast
sileo.success({ title: 'Saved', appearance: 'glass' }); // or one
```

The pill and the card are two glass views in a `GlassContainer`, which merges them the way the gooey filter does. Glass is opt-in. On Android, on iOS before 26, and with Reduce Transparency on, toasts fall back to `solid`. Glass is in Expo Go too.

## Modals and dialogs

A native modal is its own window above your app, so the root `Toaster` draws underneath it. There are two fixes, and you can use both:

**Mount a `Toaster` inside the modal.** The newest mounted `Toaster` shows the toasts, and older ones stand down until it unmounts. Toasts move into the modal while it is open and back to the root when it closes. This works on iOS and Android.

```tsx
<Modal visible={open}>
  <Screen />
  <Toaster />
</Modal>
```

**On iOS, render the root Toaster in a full-window overlay**, above every modal:

```tsx
import { FullWindowOverlay } from 'react-native-screens';

<Toaster container={Platform.OS === 'ios' ? FullWindowOverlay : undefined} />;
```

## Web

On the web, `sileo-native` re-exports the original [`sileo`](https://www.npmjs.com/package/sileo). Install it alongside (`npm i sileo`) and the same `sileo.*` calls work in Expo web. Options with no web equivalent are dropped: style objects, glass, and buttons after the first.

## API

### `sileo`

| Method | Description |
| --- | --- |
| `sileo.success(options)` | Green success toast |
| `sileo.error(options)` | Red error toast |
| `sileo.warning(options)` | Amber warning toast |
| `sileo.info(options)` | Blue info toast |
| `sileo.action(options)` | Toast with an action button |
| `sileo.show(options)` | Generic toast (state from `type`, defaults to success) |
| `sileo.promise(promise, opts)` | Loading → success / error (or action) flow |
| `sileo.dismiss(id)` | Dismiss a toast by id |
| `sileo.clear(position?)` | Clear every toast, or those at one position |

Every shortcut returns the toast id. `promise` returns the original promise.

### `SileoOptions`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | state name | Toast heading |
| `description` | `ReactNode` | — | Body content; strings are wrapped in `Text` |
| `position` | `SileoPosition` | Toaster's | Override the position for this toast |
| `duration` | `number \| null` | `6000` | Auto-dismiss in ms; `null` = sticky |
| `icon` | `ReactNode \| null` | state icon | Custom badge icon; receives `color` if it sets none |
| `fill` | `string` | theme's | Surface color (solid) |
| `roundness` | `number` | `16` | Corner radius; also sets the gooey blur |
| `appearance` | `'solid' \| 'glass'` | Toaster's | Surface for this toast |
| `styles` | `SileoStyles` | — | Style overrides for title, description, badge, buttons |
| `autopilot` | `boolean \| { expand?, collapse? }` | `true` | Auto expand/collapse timing in ms |
| `button` | `SileoButton` | — | One button (web shape) |
| `buttons` | `SileoButtons` | — | One to four buttons |
| `buttonLayout` | `'row' \| 'column'` | `'row'` | How the buttons are laid out |

### `Toaster`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `position` | `SileoPosition` | `top-center` | Default position |
| `theme` | `SileoThemeProp` | — | `light`, `dark`, `system`, overrides, or `{ light, dark }` |
| `appearance` | `'solid' \| 'glass'` | theme's | Default surface |
| `offset` | `number \| { top, right, bottom, left }` | — | Extra distance from the safe area |
| `options` | `Partial<SileoOptions>` | — | Defaults merged under every toast |
| `width` | `number` | `350` | Toast width, capped to the screen |
| `container` | `ComponentType` | — | Wraps the toasts, e.g. `FullWindowOverlay` |

## Differences from the web version

- **Tap instead of hover.** Tapping a toast with a description opens it and holds every dismiss timer. Tapping again closes it and the timers start over. A tap also stops autopilot for that toast.
- **Swipe** up or down to dismiss, as on the web, with a soft limit on the drag and a velocity check for flicks.
- **Header crossfade.** The web blurs the old and new titles as they swap. Views can't be blurred on iOS, so this version fades and scales them.
- **Backgrounding.** Timers pause while the app is in the background and start over when it returns.
- **Default position** is `top-center`, which suits a phone better than the web default of `top-right`.
- **Accessibility.** VoiceOver announces new toasts and TalkBack reads them through a live region. Each toast exposes actions for expand, each button, and dismiss (the escape gesture). Reduce Motion is respected through Reanimated.

## Development

```sh
yarn                 # install
yarn test            # unit tests
yarn typecheck
yarn lint
yarn example start   # the playground, in Expo Go
```

## License

MIT. Ported from [sileo](https://github.com/hiaaryan/sileo) by [hiaaryan](https://github.com/hiaaryan), MIT.
