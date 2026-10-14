import { Page } from '../../components/shell';
import { C, Code, H1, H2, Lead, P } from '../../components/ui';

export default function Modals() {
  return (
    <Page
      title="Modals"
      description="Show toasts above React Native modals and dialogs: mount a Toaster inside the modal on iOS and Android, or use a full-window overlay on iOS."
    >
      <H1 path="docs/modals">Modals and dialogs</H1>
      <Lead>
        A native modal is its own window above the app, so a Toaster at the root
        draws underneath it. There are two ways out, and you can use both.
      </Lead>

      <H2>A Toaster in the modal</H2>
      <P>
        Every mounted Toaster is a host, and only the newest one shows toasts.
        Mount one inside the modal and the toasts move there while it is open,
        then come back to the root when it closes. This works on iOS and
        Android.
      </P>
      <Code>{`
<Modal visible={open}>
  <Screen />
  <Toaster />
</Modal>
`}</Code>
      <P>
        The store is shared, so a toast fired from anywhere lands in whichever
        Toaster is on top, and only one renders it.
      </P>

      <H2>A full-window overlay on iOS</H2>
      <P>
        Or render the root Toaster in <C>FullWindowOverlay</C> from{' '}
        <C>react-native-screens</C>, which sits above every modal:
      </P>
      <Code>{`
import { Platform } from 'react-native';
import { FullWindowOverlay } from 'react-native-screens';

<Toaster container={Platform.OS === 'ios' ? FullWindowOverlay : undefined} />;
`}</Code>
    </Page>
  );
}
