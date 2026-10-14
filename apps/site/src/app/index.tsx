import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Page } from '../components/shell';
import { Button, Card, Chip, Code, Eyebrow, Row } from '../components/ui';
import { fireToast, type ToastType } from '../lib/demos';
import { DISPLAY, FONT, MONO, useSite } from '../lib/site';
import { data } from '../lib/web';

const DEMOS: { label: string; type: ToastType }[] = [
  { label: 'Success', type: 'success' },
  { label: 'Error', type: 'error' },
  { label: 'Warning', type: 'warning' },
  { label: 'Info', type: 'info' },
  { label: 'Action', type: 'action' },
  { label: 'Promise', type: 'promise' },
  { label: 'Buttons', type: 'buttons-2' },
];

const FEATURES = [
  {
    path: 'skia',
    title: 'The gooey morph',
    text: 'The pill melts into its card through the same blur and threshold as the web filter, drawn with Skia on the UI thread.',
  },
  {
    path: 'liquid-glass',
    title: 'Liquid Glass',
    text: 'On iOS 26 the pill and card can be glass, merged by the system. Opt in with one import.',
  },
  {
    path: 'buttons',
    title: 'Buttons and themes',
    text: 'Up to four variant buttons, light and dark themes or your own, and types that catch mistakes.',
  },
];

const INSTALL = `npx expo install sileo-native @shopify/react-native-skia react-native-reanimated react-native-worklets react-native-gesture-handler react-native-svg react-native-safe-area-context`;

const USAGE = `
import { sileo, Toaster } from 'sileo-native';

export default function App() {
  return (
    <>
      <YourApp />
      <Toaster position="top-center" theme="system" />
    </>
  );
}

sileo.success({ title: 'Changes Saved', description: 'Your profile is up to date.' });
`;

export default function Home() {
  const { c, toaster } = useSite();
  const router = useRouter();
  const fire = (type: ToastType) =>
    fireToast(type, { position: toaster.position, roundness: 16 });

  return (
    <Page width={880}>
      <View style={styles.hero}>
        <View {...data({ dots: '' })} style={styles.texture} />
        <View {...data({ glow: '' })} style={styles.texture} />

        <Text style={[styles.micro, { color: c.muted }]}>
          rayanstudio · open source · react native
        </Text>
        <Text
          role="heading"
          aria-level={1}
          {...data({ gradient: '', heroTitle: '' })}
          style={[styles.title, { color: c.fg }]}
        >
          sileo-native
        </Text>
        <Text style={[styles.tagline, { color: c.muted }]}>
          An opinionated, physics-based toast for React Native and Expo. The
          gooey morph of sileo, drawn with Skia, and Liquid Glass on iOS 26.
        </Text>

        <Row>
          {DEMOS.map((d) => (
            <Chip key={d.type} label={d.label} onPress={() => fire(d.type)} />
          ))}
        </Row>
        <Text style={[styles.note, { color: c.subtle }]}>
          These toasts are sileo-native itself, running in your browser.
        </Text>
      </View>

      <View style={styles.features}>
        {FEATURES.map((f) => (
          <Card key={f.path} style={styles.feature}>
            <Eyebrow path={f.path} />
            <Text style={[styles.featureTitle, { color: c.fg }]}>
              {f.title}
            </Text>
            <Text style={[styles.featureText, { color: c.muted }]}>
              {f.text}
            </Text>
          </Card>
        ))}
      </View>

      <View style={styles.block}>
        <Eyebrow path="install" />
        <Code lang="sh">{INSTALL}</Code>
        <Code>{USAGE}</Code>
      </View>

      <View style={styles.links}>
        <Button label="Read the docs" onPress={() => router.push('/docs')} />
        <Button
          label="Open playground"
          variant="outline"
          onPress={() => router.push('/play')}
        />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: 104, paddingBottom: 40, gap: 20 },
  texture: {
    position: 'absolute',
    top: 0,
    left: -400,
    right: -400,
    height: 520,
  },
  micro: {
    fontFamily: MONO,
    fontSize: 11.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: DISPLAY,
    fontSize: 80,
    lineHeight: 84,
    fontWeight: '600',
  },
  tagline: {
    fontFamily: FONT,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
    maxWidth: 620,
  },
  note: { fontFamily: FONT, fontSize: 13 },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 16,
  },
  feature: { flexGrow: 1, flexBasis: 240, gap: 10 },
  featureTitle: { fontFamily: DISPLAY, fontSize: 19, fontWeight: '600' },
  featureText: { fontFamily: FONT, fontSize: 14, lineHeight: 21 },
  block: { marginTop: 56, gap: 4 },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 24 },
});
