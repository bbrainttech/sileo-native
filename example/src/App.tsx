import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { FullWindowOverlay } from 'react-native-screens';
import {
  SILEO_POSITIONS,
  sileo,
  Toaster,
  type SileoAppearance,
  type SileoPosition,
  type SileoThemeProp,
} from 'sileo-native';
import 'sileo-native/glass';
import { useAutomation } from './automation';
import { BUTTONS, fireToast } from './demos';

type Theme = 'light' | 'dark' | 'system' | 'brand';
type ModalMode = 'nested' | 'overlay';

const THEMES: Theme[] = ['light', 'dark', 'system', 'brand'];
const APPEARANCES: SileoAppearance[] = ['solid', 'glass'];
const ROUNDNESS = [0, 8, 12, 16, 20];

/* a custom theme per scheme, laid over the built-in ones */
const BRAND: SileoThemeProp = {
  light: {
    fill: '#2e1065',
    description: 'rgba(237, 233, 254, 0.7)',
    stateColors: { success: '#4ade80', action: '#c4b5fd' },
  },
  dark: {
    fill: '#ede9fe',
    description: 'rgba(46, 16, 101, 0.6)',
    stateColors: { action: '#7c3aed' },
  },
};

export default function App() {
  const system = useColorScheme();
  const [theme, setTheme] = useState<Theme>('light');
  const [position, setPosition] = useState<SileoPosition>('top-center');
  const [roundness, setRoundness] = useState(16);
  const [appearance, setAppearance] = useState<SileoAppearance>('solid');
  const [modal, setModal] = useState<ModalMode | null>(null);

  const dark =
    theme === 'dark' ||
    ((theme === 'system' || theme === 'brand') && system === 'dark');
  const c = dark ? colors.dark : colors.light;
  const toasterTheme: SileoThemeProp = theme === 'brand' ? BRAND : theme;

  const fire = (type: (typeof BUTTONS)[number]['type']) =>
    fireToast(type, { position, roundness });

  useAutomation({
    fire,
    setPosition,
    setTheme,
    setRoundness,
    setAppearance,
    setModal,
  });

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar style={dark ? 'light' : 'dark'} />
        <SafeAreaView style={[styles.flex, { backgroundColor: c.bg }]}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.hero}>
              <Text style={[styles.title, { color: c.fg }]}>
                Playground<Text style={{ color: c.dim }}>.</Text>
              </Text>
              <Text style={[styles.subtitle, { color: c.muted }]}>
                Pick a position, tap any type to fire it live.
              </Text>
            </View>

            <Section label="Position" c={c}>
              {SILEO_POSITIONS.map((pos) => (
                <Chip
                  key={pos}
                  label={pos}
                  active={position === pos}
                  onPress={() => setPosition(pos)}
                  c={c}
                />
              ))}
            </Section>

            <Section label="Theme" c={c}>
              {THEMES.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  active={theme === t}
                  onPress={() => setTheme(t)}
                  c={c}
                />
              ))}
            </Section>

            <Section label="Appearance" c={c}>
              {APPEARANCES.map((a) => (
                <Chip
                  key={a}
                  label={a}
                  active={appearance === a}
                  onPress={() => setAppearance(a)}
                  c={c}
                />
              ))}
            </Section>

            <Section label="Roundness" c={c}>
              {ROUNDNESS.map((r) => (
                <Chip
                  key={r}
                  label={String(r)}
                  active={roundness === r}
                  onPress={() => setRoundness(r)}
                  c={c}
                />
              ))}
            </Section>

            <View style={[styles.divider, { borderColor: c.border }]} />

            <Section label="Fire" c={c}>
              {BUTTONS.map((b) => (
                <Chip
                  key={b.type}
                  label={b.label}
                  onPress={() => fire(b.type)}
                  c={c}
                />
              ))}
            </Section>

            <Section label="Control" c={c}>
              <Chip
                label="Dismiss"
                onPress={() => sileo.dismiss('sileo-default')}
                c={c}
              />
              <Chip label="Clear all" onPress={() => sileo.clear()} c={c} />
              <Chip
                label="Modal + Toaster"
                onPress={() => setModal('nested')}
                c={c}
              />
              <Chip
                label="Modal + window overlay"
                onPress={() => setModal('overlay')}
                c={c}
              />
            </Section>
          </ScrollView>
        </SafeAreaView>

        <Modal
          visible={modal !== null}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setModal(null)}
        >
          <View style={[styles.modal, { backgroundColor: c.bg }]}>
            <Text style={[styles.subtitle, { color: c.muted }]}>
              {modal === 'nested'
                ? 'This modal mounts its own Toaster, which takes over while it is open.'
                : 'The root Toaster draws in a FullWindowOverlay, above the modal (iOS).'}
            </Text>
            <View style={styles.row}>
              <Chip label="Success" onPress={() => fire('success')} c={c} />
              <Chip label="Promise" onPress={() => fire('promise')} c={c} />
              <Chip label="2 buttons" onPress={() => fire('buttons-2')} c={c} />
              <Chip label="Close" onPress={() => setModal(null)} c={c} />
            </View>
          </View>
          {modal === 'nested' && (
            <Toaster
              position={position}
              theme={toasterTheme}
              appearance={appearance}
            />
          )}
        </Modal>

        <Toaster
          position={position}
          theme={toasterTheme}
          appearance={appearance}
          container={
            modal === 'overlay' && Platform.OS === 'ios'
              ? FullWindowOverlay
              : undefined
          }
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/* -------------------------------- Controls -------------------------------- */

type Palette = (typeof colors)['light'];

function Section({
  label,
  c,
  children,
}: {
  label: string;
  c: Palette;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.label, { color: c.muted }]}>{label}</Text>
      <View style={styles.row}>{children}</View>
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
  c,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  c: Palette;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { borderColor: c.border, backgroundColor: active ? c.fg : c.chip },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.chipText, { color: active ? c.bg : c.fg }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const colors = {
  light: {
    bg: '#ffffff',
    fg: '#0a0a0a',
    muted: '#a3a3a3',
    dim: '#d4d4d4',
    border: '#e5e5e5',
    chip: '#fafafa',
  },
  dark: {
    bg: '#0a0a0a',
    fg: '#fafafa',
    muted: '#737373',
    dim: '#404040',
    border: '#262626',
    chip: '#171717',
  },
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 48 },
  hero: { alignItems: 'center', paddingTop: 96, paddingBottom: 40 },
  title: { fontSize: 40, fontWeight: '600', letterSpacing: -1.5 },
  subtitle: { marginTop: 12, fontSize: 15, textAlign: 'center' },
  section: { marginBottom: 20, gap: 10 },
  label: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: { fontSize: 13, fontWeight: '500' },
  pressed: { opacity: 0.6 },
  divider: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 12,
    marginBottom: 28,
  },
  modal: { flex: 1, padding: 24, gap: 16, justifyContent: 'center' },
});
