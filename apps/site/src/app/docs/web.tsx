import { Page } from '../../components/shell';
import { A, C, Code, H1, H2, Lead, List, P } from '../../components/ui';

export default function Web() {
  return (
    <Page title="Web">
      <H1 path="docs/web">Web</H1>
      <Lead>
        On the web, sileo-native is sileo: the package re-exports the original,
        so the same calls work in Expo web and the browser gets the toast built
        for it.
      </Lead>

      <H2>Set up</H2>
      <Code lang="sh">{`npm i sileo`}</Code>
      <P>
        Nothing else changes. Keep importing from <C>sileo-native</C>; the web
        build resolves to <A href="https://github.com/hiaaryan/sileo">sileo</A>{' '}
        through the package’s browser entry.
      </P>

      <H2>What carries over</H2>
      <List
        items={[
          'Every sileo.* call, positions, durations, autopilot, roundness and fill.',
          'The first button. onPress is passed on as the web onClick.',
          'Named themes: light, dark and system. A theme object passes its fill on.',
        ]}
      />

      <H2>What does not</H2>
      <List
        items={[
          'Style objects in styles, which the web build takes as class names.',
          'Glass, which needs iOS 26.',
          'Buttons after the first.',
        ]}
      />
      <P>
        This site is the exception: it runs sileo-native’s native renderer in
        the browser, through react-native-web and CanvasKit, so you can see the
        real thing.
      </P>
    </Page>
  );
}
