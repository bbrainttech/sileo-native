import { Page } from '../../components/shell';
import { A, C, Code, H1, H2, Lead, List, P } from '../../components/ui';
import { sileo } from '../../lib/sileo';

export default function GettingStarted() {
  return (
    <Page title="Getting started">
      <H1 path="docs">Getting started</H1>
      <Lead>
        sileo-native is the toast from sileo for React Native and Expo: the same
        API, and the same pill that melts into a card, drawn with Skia on the UI
        thread.
      </Lead>

      <H2>Install</H2>
      <Code lang="sh">
        {`npx expo install sileo-native @shopify/react-native-skia react-native-reanimated react-native-worklets react-native-gesture-handler react-native-svg react-native-safe-area-context`}
      </Code>
      <P>
        Every peer dependency ships in Expo Go, so there is no development build
        to make. Reanimated 4 needs the New Architecture, which is the default
        from Expo SDK 52.
      </P>

      <H2>Add the Toaster</H2>
      <P>
        Render one <C>Toaster</C> after your app, inside your providers:
      </P>
      <Code>{`
import { Toaster } from 'sileo-native';

export default function App() {
  return (
    <>
      <YourApp />
      <Toaster position="top-center" theme="system" />
    </>
  );
}
`}</Code>
      <P>
        With a <C>SafeAreaProvider</C> in the tree (Expo Router adds one),
        toasts sit clear of the notch and the home indicator.
      </P>

      <H2>Fire a toast</H2>
      <P>
        Import <C>sileo</C> anywhere, no hook or context needed:
      </P>
      <Code
        run={() =>
          sileo.success({
            title: 'Changes Saved',
            description: 'Your profile is up to date.',
          })
        }
      >{`
import { sileo } from 'sileo-native';

sileo.success({
  title: 'Changes Saved',
  description: 'Your profile is up to date.',
});
`}</Code>
      <P>
        A toast with a description opens into a card on its own, then closes
        before it goes. Tap it to open it yourself, and swipe it away to dismiss
        it.
      </P>

      <H2>Promises</H2>
      <Code
        run={() =>
          sileo.promise(new Promise((r) => setTimeout(r, 2000)), {
            loading: { title: 'Saving' },
            success: { title: 'Saved', description: 'All changes are live.' },
            error: { title: 'Could not save' },
          })
        }
      >{`
sileo.promise(saveProfile(), {
  loading: { title: 'Saving' },
  success: { title: 'Saved', description: 'All changes are live.' },
  error: (err) => ({ title: 'Could not save', description: String(err) }),
});
`}</Code>

      <H2>Next</H2>
      <List
        items={[
          <A key="api" href="/docs/api">
            The full API
          </A>,
          <A key="buttons" href="/docs/buttons">
            Buttons
          </A>,
          <A key="theming" href="/docs/theming">
            Themes and styling
          </A>,
          <A key="play" href="/play">
            The playground
          </A>,
        ]}
      />
    </Page>
  );
}
