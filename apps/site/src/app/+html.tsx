import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

const DESCRIPTION =
  'An opinionated, physics-based toast component for React Native and Expo. A native port of sileo, by rayanstudio.';

const FONTS =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=Google+Sans:wght@400..700&family=Google+Sans+Code:wght@400..700&display=swap';

/*
 * rayanstudio's design system, for what React Native styles cannot say.
 * Views opt in with `data-*` attributes (see `lib/web.ts`).
 *
 * - Squircles for blocks and cards: where `corner-shape` is supported the
 *   radius grows about 2.4× and takes the squircle curve; elsewhere the plain
 *   radius from the style stays.
 * - Superellipse pills for buttons and chips, on one shared curve.
 * - Gradient text, the dot grid, the primary glow and the faded wordmark.
 *
 * The page is dark until React says otherwise, so nothing flashes white,
 * and the docs sidebar and its phone tabs are picked by width in CSS so the
 * static HTML and the first client render agree.
 */
const CSS = `
:root { --radius: 0.7rem; --superellipse-curve: 1.25; }
[data-theme='dark'] { --fg: #fafafa; --muted-fg: #a1a1a1; --primary: #2b7fff; --grid: rgba(250, 250, 250, 0.13); --hover: rgba(255, 255, 255, 0.07); }
[data-theme='light'] { --fg: #09090b; --muted-fg: #71717b; --primary: #155dfc; --grid: rgba(9, 9, 11, 0.14); --hover: #f4f4f5; }
body { background: #09090b; }
::selection { background: rgba(21, 93, 252, 0.4); }

@supports (corner-shape: squircle) {
  [data-squircle] { corner-shape: squircle; }
  [data-squircle='lg'] { border-radius: calc(var(--radius) * 2.4) !important; }
  [data-squircle='xl'] { border-radius: calc(var(--radius) * 1.4 * 2.4) !important; }
  [data-squircle='2xl'] { border-radius: calc(var(--radius) * 1.8 * 2.4) !important; }
  [data-squircle='3xl'] { border-radius: calc(var(--radius) * 2.2 * 2.4) !important; }
  [data-pill] { corner-shape: superellipse(var(--superellipse-curve)); }
}

[data-gradient] {
  background-image: linear-gradient(to bottom right, var(--fg) 30%, var(--muted-fg));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent !important;
}
[data-gradient='primary'] {
  background-image: linear-gradient(to right, var(--fg) 35%, var(--primary));
}

[data-dots] {
  background-image: radial-gradient(var(--grid) 1px, transparent 1px);
  background-size: 12px 12px;
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 75%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 75%);
}
[data-glow] {
  background: radial-gradient(ellipse 50% 60% at 50% 0%, color-mix(in oklch, var(--primary) 22%, transparent), transparent 70%);
}

[data-wordmark] {
  background-image: linear-gradient(to bottom, var(--fg) 10%, transparent 85%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent !important;
  opacity: 0.14;
}

/* the rayanstudio mark is a black squircle; on the dark page it inverts */
[data-theme='dark'] [data-invert-dark] { filter: invert(1); }

[data-hover]:hover { background-color: var(--hover) !important; }

[data-press] { transition: transform 150ms ease, background-color 150ms ease, opacity 150ms ease; }
[data-press]:active { transform: scale(0.98); }

@media (max-width: 480px) {
  [data-hide-sm] { display: none !important; }
  [data-nav-inner] { padding-left: 16px !important; padding-right: 12px !important; }
  [data-nav-link] { padding-left: 9px !important; padding-right: 9px !important; }
  [data-hero-title] { font-size: 56px !important; line-height: 60px !important; }
}

[data-docs-sidebar] { display: none !important; }
@media (min-width: 900px) {
  [data-docs-sidebar] { display: flex !important; }
  [data-docs-tabs] { display: none !important; }
}
`;

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="description" content={DESCRIPTION} />
        <meta name="theme-color" content="#09090b" />
        <meta property="og:title" content="sileo-native" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content="https://sileo.rayanstudio.dev" />
        <meta name="twitter:card" content="summary" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/rayanstudio.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link rel="stylesheet" href={FONTS} />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
