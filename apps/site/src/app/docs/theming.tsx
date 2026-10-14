import { Page } from '../../components/shell';
import { C, Code, H1, H2, Lead, P, Props } from '../../components/ui';
import { sileo } from '../../lib/sileo';

export default function Theming() {
  return (
    <Page title="Theming">
      <H1 path="docs/theming">Theming</H1>
      <Lead>
        A theme sets the toast’s colors, corners, surface and font. Pick a
        built-in one, lay your own over it, or style a single toast.
      </Lead>

      <H2>The theme prop</H2>
      <Code>{`
<Toaster theme="system" />                 // light, dark, or system
<Toaster theme={{ fill: '#155dfc' }} />    // overrides on the default
<Toaster
  theme={{                                 // overrides per scheme
    light: { fill: '#155dfc' },
    dark: { fill: '#1f56aa' },
  }}
/>
`}</Code>
      <P>
        The names describe the app, as on the web: <C>light</C> gives a dark
        toast that stands off a light app, and <C>dark</C> gives a light one.
        Without a theme, toasts are white.
      </P>

      <H2>Tokens</H2>
      <Props
        rows={[
          {
            name: 'fill',
            type: 'string',
            children: 'The surface of a solid toast.',
          },
          {
            name: 'description',
            type: 'string',
            children: 'Description text on a solid toast.',
          },
          {
            name: 'title',
            type: 'string',
            children: 'Title color. Unset, the title takes the state color.',
          },
          {
            name: 'stateColors',
            type: 'Record<SileoState, string>',
            children: 'One color per state, for the badge, title and buttons.',
          },
          {
            name: 'tones',
            type: '{ badge, button, buttonPressed }',
            children:
              'How opaque the state color is behind the badge and buttons.',
          },
          {
            name: 'roundness',
            type: 'number',
            default: '16',
            children: 'Corner radius.',
          },
          {
            name: 'appearance',
            type: "'solid' | 'glass'",
            default: "'solid'",
            children: 'The surface.',
          },
          {
            name: 'glass',
            type: '{ style, tint, colorScheme, description }',
            children: 'Liquid Glass settings.',
          },
          {
            name: 'fontFamily',
            type: 'string',
            children: 'Every text in the toast.',
          },
        ]}
      />
      <P>
        Build a theme in code with <C>createTheme(overrides, base)</C>. The
        built-ins are exported as <C>defaultTheme</C>, <C>themes.light</C> and{' '}
        <C>themes.dark</C>.
      </P>

      <H2>One toast</H2>
      <Code
        run={() =>
          sileo.action({
            title: 'New Sale',
            fill: '#000000',
            description: 'Someone just bought the Pro plan.',
            styles: {
              title: { color: '#ffffff' },
              description: { color: 'rgba(255, 255, 255, 0.75)' },
              badge: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
              button: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
              buttonText: { color: '#ffffff' },
            },
            button: { title: 'View Order', onPress: () => {} },
          })
        }
      >{`
sileo.action({
  title: 'New Sale',
  fill: '#000000',
  styles: {
    title: { color: '#ffffff' },
    description: { color: 'rgba(255, 255, 255, 0.75)' },
    badge: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
    button: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
    buttonText: { color: '#ffffff' },
  },
});
`}</Code>

      <H2>Custom content</H2>
      <P>
        Nothing inherits a color on native, so a custom description reads the
        toast’s colors from <C>useSileoTheme()</C>:
      </P>
      <Code>{`
function Paid() {
  const { tone, text } = useSileoTheme();
  return (
    <Text style={{ color: text }}>
      Received <Text style={{ color: tone }}>$49.00</Text>
    </Text>
  );
}

sileo.success({ title: 'Payment received', description: <Paid /> });
`}</Code>
      <P>
        It returns the resolved theme plus the toast’s <C>state</C>, <C>tone</C>
        , <C>fill</C>, the <C>appearance</C> actually drawn, and the description
        color for it as <C>text</C>.
      </P>
    </Page>
  );
}
