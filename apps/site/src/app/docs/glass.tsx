import { Page } from '../../components/shell';
import { C, Code, H1, H2, Lead, List, P } from '../../components/ui';

export default function Glass() {
  return (
    <Page
      title="Liquid Glass"
      description="Draw sileo-native toasts in Liquid Glass on iOS 26 with expo-glass-effect. It is opt-in, for every toast or just one, and the solid toast stays the default."
    >
      <H1 path="docs/glass">Liquid Glass</H1>
      <Lead>
        On iOS 26, toasts can be drawn in Liquid Glass. It is opt-in: the solid
        gooey toast stays the default.
      </Lead>

      <H2>Turn it on</H2>
      <Code lang="sh">{`npx expo install expo-glass-effect`}</Code>
      <Code>{`
import 'sileo-native/glass'; // once, anywhere

<Toaster appearance="glass" />;                          // every toast
sileo.success({ title: 'Saved', appearance: 'glass' });  // or one
`}</Code>
      <P>
        The import registers <C>expo-glass-effect</C> with sileo-native. The
        core never imports it, so apps without it bundle fine.
      </P>

      <H2>How it morphs</H2>
      <P>
        The pill and the card are two glass views in one <C>GlassContainer</C>,
        which melts glass shapes together where they meet. The card starts as
        the pill’s footprint and spreads to full width as it grows, the way the
        gooey filter does.
      </P>

      <H2>Tint</H2>
      <P>
        The built-in themes tint the glass lightly, white in a light app and
        dark in a dark one, so text stays readable over busy content. Change it
        through the theme, or set it to <C>transparent</C>:
      </P>
      <Code>{`
<Toaster appearance="glass" theme={{ glass: { tint: 'transparent' } }} />
`}</Code>

      <H2>Fallbacks</H2>
      <List
        items={[
          'Android, iOS before 26, and the web draw the solid toast.',
          'So does iOS with Reduce Transparency on.',
          'Without the import, glass falls back to solid and warns once in development.',
        ]}
      />
    </Page>
  );
}
