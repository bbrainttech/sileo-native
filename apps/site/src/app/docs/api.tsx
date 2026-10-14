import { Page } from '../../components/shell';
import { C, Code, H1, H2, Lead, P, Props } from '../../components/ui';
import { sileo } from '../../lib/sileo';

export default function Api() {
  return (
    <Page
      title="API"
      description="The sileo API: success, error, warning, info, action, show and promise, plus dismiss and clear, and every option a toast takes."
    >
      <H1 path="docs/api">API</H1>
      <Lead>
        <C>sileo</C> fires and controls toasts from anywhere. Every shortcut
        returns the toast id, and <C>promise</C> returns the promise it was
        given.
      </Lead>

      <H2>sileo</H2>
      <Props
        rows={[
          {
            name: 'success(options)',
            type: 'string',
            children: 'A green success toast.',
          },
          {
            name: 'error(options)',
            type: 'string',
            children: 'A red error toast.',
          },
          {
            name: 'warning(options)',
            type: 'string',
            children: 'An amber warning toast.',
          },
          {
            name: 'info(options)',
            type: 'string',
            children: 'A blue info toast.',
          },
          {
            name: 'action(options)',
            type: 'string',
            children: 'A toast meant to carry a button.',
          },
          {
            name: 'show(options)',
            type: 'string',
            children:
              'A toast in the state given by its type option, success when none is given.',
          },
          {
            name: 'promise(promise, options)',
            type: 'Promise<T>',
            children:
              'Loading while the promise is pending, then success, action, or error.',
          },
          { name: 'dismiss(id)', type: 'void', children: 'Dismiss one toast.' },
          {
            name: 'clear(position?)',
            type: 'void',
            children: 'Clear every toast, or only those at one position.',
          },
        ]}
      />
      <P>
        Like sileo on the web, every toast shares one id. A new toast does not
        stack on the last one; it morphs the visible toast into the new content.
      </P>
      <Code
        run={() => {
          sileo.info({ title: 'Uploading' });
          setTimeout(() => sileo.success({ title: 'Uploaded' }), 1200);
        }}
      >{`
sileo.info({ title: 'Uploading' });
// a moment later, the same toast becomes:
sileo.success({ title: 'Uploaded' });
`}</Code>

      <H2>Options</H2>
      <Props
        rows={[
          {
            name: 'title',
            type: 'string',
            default: 'state',
            children: 'The heading.',
          },
          {
            name: 'description',
            type: 'ReactNode',
            children:
              'The body of the card. A string is wrapped in Text; any node is rendered as given.',
          },
          {
            name: 'position',
            type: 'SileoPosition',
            children: 'Override the Toaster’s position.',
          },
          {
            name: 'duration',
            type: 'number | null',
            default: '6000',
            children:
              'Milliseconds before it dismisses itself. null keeps it until dismissed.',
          },
          {
            name: 'icon',
            type: 'ReactNode | null',
            children:
              'Replaces the state icon. An element without a color prop is given the state color.',
          },
          {
            name: 'fill',
            type: 'string',
            children: 'The surface color. Overrides the theme.',
          },
          {
            name: 'roundness',
            type: 'number',
            default: '16',
            children: 'Corner radius, which also sets how far the goo blurs.',
          },
          {
            name: 'appearance',
            type: "'solid' | 'glass'",
            children: 'Overrides the Toaster’s appearance.',
          },
          {
            name: 'styles',
            type: 'SileoStyles',
            children:
              'Style objects for title, description, badge, button and buttonText.',
          },
          {
            name: 'autopilot',
            type: 'boolean | { expand, collapse }',
            default: 'true',
            children:
              'Open and close the card on a timer. false leaves it to the reader.',
          },
          {
            name: 'button',
            type: 'SileoButton',
            children: 'One button, the web shape.',
          },
          {
            name: 'buttons',
            type: 'SileoButtons',
            children: 'One to four buttons.',
          },
          {
            name: 'buttonLayout',
            type: "'row' | 'column'",
            default: "'row'",
            children: 'Side by side, or stacked.',
          },
        ]}
      />

      <H2>Promise options</H2>
      <Props
        rows={[
          {
            name: 'loading',
            type: 'SileoOptions',
            children:
              'Shown while the promise is pending. Never dismisses itself.',
          },
          {
            name: 'success',
            type: 'SileoOptions | (data) => SileoOptions',
            children: 'Shown when it resolves.',
          },
          {
            name: 'error',
            type: 'SileoOptions | (err) => SileoOptions',
            children: 'Shown when it rejects.',
          },
          {
            name: 'action',
            type: 'SileoOptions | (data) => SileoOptions',
            children: 'Shown instead of success when given.',
          },
          {
            name: 'position',
            type: 'SileoPosition',
            children:
              'Where the whole flow plays. Without it, the loading toast’s position, then the Toaster’s.',
          },
        ]}
      />
    </Page>
  );
}
