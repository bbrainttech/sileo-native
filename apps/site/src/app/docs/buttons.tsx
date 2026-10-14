import { Page } from '../../components/shell';
import { C, Code, H1, H2, Lead, P, Props } from '../../components/ui';
import { sileo } from '../../lib/sileo';

export default function Buttons() {
  return (
    <Page
      title="Buttons"
      description="Add up to four buttons to a sileo-native toast. Each takes a title, an onPress handler and a variant that colors it, and can dismiss the toast."
    >
      <H1 path="docs/buttons">Buttons</H1>
      <Lead>Up to four buttons in the card, each colored by a variant.</Lead>

      <Code
        run={() =>
          sileo.warning({
            title: 'Unsaved Changes',
            description: 'You have edits that have not been saved yet.',
            duration: 10000,
            buttons: [
              {
                title: 'Save',
                variant: 'success',
                dismiss: true,
                onPress: () => sileo.success({ title: 'Saved' }),
              },
              {
                title: 'Discard',
                variant: 'error',
                dismiss: true,
                onPress: () => sileo.error({ title: 'Discarded' }),
              },
            ],
          })
        }
      >{`
sileo.warning({
  title: 'Unsaved Changes',
  description: 'You have edits that have not been saved yet.',
  buttons: [
    { title: 'Save', variant: 'success', dismiss: true, onPress: save },
    { title: 'Discard', variant: 'error', dismiss: true, onPress: discard },
  ],
});
`}</Code>

      <H2>Button</H2>
      <Props
        rows={[
          { name: 'title', type: 'string', children: 'The label.' },
          {
            name: 'onPress',
            type: '() => void',
            children:
              'Called on press. onClick, the web name, works too: one or the other.',
          },
          {
            name: 'variant',
            type: 'SileoVariant | neutral',
            children:
              'success, error, warning, info, action, or neutral. Defaults to the toast’s own state.',
          },
          {
            name: 'dismiss',
            type: 'boolean',
            default: 'false',
            children: 'Dismiss the toast after the press.',
          },
          {
            name: 'style',
            type: 'StyleProp<ViewStyle>',
            children: 'This button only.',
          },
          {
            name: 'textStyle',
            type: 'StyleProp<TextStyle>',
            children: 'This label only.',
          },
          {
            name: 'accessibilityLabel',
            type: 'string',
            children: 'Read instead of the title.',
          },
        ]}
      />

      <H2>Four, or stacked</H2>
      <Code
        run={() =>
          sileo.info({
            title: 'How was your ride?',
            description: 'Tap one to rate your trip.',
            duration: 10000,
            buttons: [
              {
                title: 'Great',
                variant: 'success',
                dismiss: true,
                onPress: () => {},
              },
              {
                title: 'Okay',
                variant: 'info',
                dismiss: true,
                onPress: () => {},
              },
              {
                title: 'Meh',
                variant: 'warning',
                dismiss: true,
                onPress: () => {},
              },
              {
                title: 'Bad',
                variant: 'error',
                dismiss: true,
                onPress: () => {},
              },
            ],
          })
        }
      >{`
sileo.info({
  title: 'How was your ride?',
  buttons: [
    { title: 'Great', variant: 'success', onPress: rate },
    { title: 'Okay', variant: 'info', onPress: rate },
    { title: 'Meh', variant: 'warning', onPress: rate },
    { title: 'Bad', variant: 'error', onPress: rate },
  ],
});
`}</Code>
      <Code
        run={() =>
          sileo.action({
            title: 'Invite Accepted',
            description: 'Sam joined your workspace. What next?',
            duration: 10000,
            buttonLayout: 'column',
            buttons: [
              { title: 'Say hello', onPress: () => {} },
              { title: 'Assign a task', variant: 'success', onPress: () => {} },
              {
                title: 'Not now',
                variant: 'neutral',
                dismiss: true,
                onPress: () => {},
              },
            ],
          })
        }
      >{`
sileo.action({
  title: 'Invite Accepted',
  buttonLayout: 'column',
  buttons: [
    { title: 'Say hello', onPress: greet },
    { title: 'Assign a task', variant: 'success', onPress: assign },
    { title: 'Not now', variant: 'neutral', dismiss: true, onPress: () => {} },
  ],
});
`}</Code>

      <H2>Types</H2>
      <P>
        <C>buttons</C> is typed as a tuple of one to four, so a fifth is a type
        error, and so is a button with both <C>onPress</C> and <C>onClick</C>.
        The web shape, <C>{'button: { title, onClick }'}</C>, still works.
      </P>
    </Page>
  );
}
