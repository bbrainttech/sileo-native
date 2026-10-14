import { Page } from '../../components/shell';
import { A, C, Code, H1, H2, Lead, List, P, Props } from '../../components/ui';

export default function ToasterDocs() {
  return (
    <Page title="Toaster">
      <H1 path="docs/toaster">Toaster</H1>
      <Lead>
        The one component sileo-native needs. Mount it once, above the rest of
        your app.
      </Lead>

      <Code>{`
<Toaster
  position="top-center"
  theme="system"
  offset={8}
  options={{ roundness: 20 }}
/>
`}</Code>

      <H2>Props</H2>
      <Props
        rows={[
          {
            name: 'position',
            type: 'SileoPosition',
            default: "'top-center'",
            children: 'Where toasts go unless they say otherwise.',
          },
          {
            name: 'theme',
            type: 'SileoThemeProp',
            children: (
              <>
                light, dark, system, overrides, or {'{ light, dark }'}. See{' '}
                <A href="/docs/theming">Theming</A>.
              </>
            ),
          },
          {
            name: 'appearance',
            type: "'solid' | 'glass'",
            children: 'Overrides the theme’s appearance.',
          },
          {
            name: 'offset',
            type: 'number | { top, right, bottom, left }',
            children:
              'Extra distance from the safe area, on top of 12pt of padding.',
          },
          {
            name: 'options',
            type: 'Partial<SileoOptions>',
            children: 'Defaults merged under every toast.',
          },
          {
            name: 'width',
            type: 'number',
            default: '350',
            children: 'Toast width, capped to the screen.',
          },
          {
            name: 'container',
            type: 'ComponentType',
            children: (
              <>
                Wraps the toasts, for example in <C>FullWindowOverlay</C>. See{' '}
                <A href="/docs/modals">Modals</A>.
              </>
            ),
          },
        ]}
      />

      <H2>Positions</H2>
      <P>
        <C>top-left</C>, <C>top-center</C>, <C>top-right</C>, <C>bottom-left</C>
        , <C>bottom-center</C> and <C>bottom-right</C>. Toasts at the bottom
        open upward. The default is <C>top-center</C>, which suits a phone
        better than the web default of <C>top-right</C>.
      </P>

      <H2>On a phone</H2>
      <List
        items={[
          'Tap a toast with a description to open it. Every dismiss timer holds while it is open, and starts over when you tap it closed.',
          'Swipe up or down to dismiss.',
          'Timers pause while the app is in the background.',
          'VoiceOver announces new toasts, TalkBack reads them through a live region, and each toast offers actions to expand, press its buttons, and dismiss.',
          'Reduce Motion is respected.',
        ]}
      />
    </Page>
  );
}
