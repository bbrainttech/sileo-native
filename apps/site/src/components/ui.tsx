import { Link, type Href } from 'expo-router';
import { Fragment, type ReactNode } from 'react';
import {
  Pressable,
  type PressableStateCallbackType,
  ScrollView,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { sileo } from '../lib/sileo';
import { DISPLAY, FONT, MONO, type Palette, useSite } from '../lib/site';
import { data, radius } from '../lib/web';

/** react-native-web adds `hovered`; React Native's types do not know it */
export type WebPressState = PressableStateCallbackType & { hovered?: boolean };

/* ---------------------------------- Text ---------------------------------- */

/** rayanstudio's eyebrow: a terminal glyph and a `~/path` in mono */
export function Eyebrow({ path }: { path: string }) {
  const { c } = useSite();
  return (
    <View style={s.eyebrow}>
      <Svg
        width={14}
        height={14}
        viewBox="0 0 24 24"
        fill="none"
        stroke={c.accent}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="m4 17 6-6-6-6M12 19h8" />
      </Svg>
      <Text style={[s.eyebrowText, { color: c.accent }]}>~/{path}</Text>
    </View>
  );
}

/** a page heading in the display face, clipped to the foreground gradient */
export function H1({ children, path }: { children: ReactNode; path?: string }) {
  const { c } = useSite();
  return (
    <View style={s.h1Block}>
      {path && <Eyebrow path={path} />}
      <Text
        role="heading"
        aria-level={1}
        {...data({ gradient: '' })}
        style={[s.h1, { color: c.fg }]}
      >
        {children}
      </Text>
    </View>
  );
}

export function H2({ children }: { children: ReactNode }) {
  const { c } = useSite();
  return (
    <Text role="heading" aria-level={2} style={[s.h2, { color: c.fg }]}>
      {children}
    </Text>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  const { c } = useSite();
  return <Text style={[s.lead, { color: c.muted }]}>{children}</Text>;
}

export function P({ children }: { children: ReactNode }) {
  const { c } = useSite();
  return <Text style={[s.p, { color: c.muted }]}>{children}</Text>;
}

/** inline code, inside a `P` */
export function C({ children }: { children: ReactNode }) {
  const { c } = useSite();
  return (
    <Text style={[s.inlineCode, { color: c.fg, backgroundColor: c.code }]}>
      {children}
    </Text>
  );
}

export function Strong({ children }: { children: ReactNode }) {
  const { c } = useSite();
  return <Text style={[s.strong, { color: c.fg }]}>{children}</Text>;
}

export function A({ href, children }: { href: Href; children: ReactNode }) {
  const { c } = useSite();
  const external = typeof href === 'string' && href.startsWith('http');
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      style={[s.link, { color: c.accent }]}
    >
      {children}
    </Link>
  );
}

export function List({ items }: { items: ReactNode[] }) {
  const { c } = useSite();
  return (
    <View style={s.list}>
      {items.map((item, i) => (
        <View key={i} style={s.listItem}>
          <View style={[s.bullet, { backgroundColor: c.subtle }]} />
          <Text style={[s.p, s.flex, { color: c.muted }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

/* ------------------------------- Highlighting ----------------------------- */

const TS_TOKEN =
  /(\/\/.*$|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|\b(import|from|export|const|let|function|return|true|false|null|undefined|await|async|new|type|interface|default|as)\b|\b(\d+(?:\.\d+)?)\b|(<\/?[A-Za-z][\w.]*|\/?>)/gm;

const SH_TOKEN = /(#.*$)|('(?:[^'])*'|"(?:\\.|[^"\\])*")|^(\s*\w[\w-]*)/gm;

type Kind = keyof Palette['syntax'];

function highlight(code: string, lang: 'ts' | 'sh') {
  const re = lang === 'sh' ? SH_TOKEN : TS_TOKEN;
  const kinds: (Kind | undefined)[] =
    lang === 'sh'
      ? [undefined, 'comment', 'string', 'keyword']
      : [undefined, 'comment', 'string', 'keyword', 'number', 'tag'];
  const parts: { text: string; kind?: Kind }[] = [];
  let last = 0;
  for (const m of code.matchAll(re)) {
    const index = m.index ?? 0;
    if (index > last) parts.push({ text: code.slice(last, index) });
    const group = m.findIndex((g, i) => i > 0 && g !== undefined);
    parts.push({ text: m[0], kind: kinds[group] });
    last = index + m[0].length;
  }
  if (last < code.length) parts.push({ text: code.slice(last) });
  return parts;
}

/* ---------------------------------- Code ---------------------------------- */

const copy = (text: string) => {
  try {
    void navigator.clipboard.writeText(text);
    sileo.success({ title: 'Copied' });
  } catch {}
};

interface CodeProps {
  children: string;
  lang?: 'ts' | 'sh';
  /** fires the snippet; shows a Run button */
  run?: () => void;
}

export function Code({ children, lang = 'ts', run }: CodeProps) {
  const { c } = useSite();
  const code = children.trim();
  return (
    <View
      {...data({ squircle: 'xl' })}
      style={[s.code, { backgroundColor: c.code, borderColor: c.border }]}
    >
      <ScrollView horizontal contentContainerStyle={s.codeScroll}>
        <Text style={[s.codeText, { color: c.fg }]}>
          {highlight(code, lang).map((part, i) =>
            part.kind ? (
              <Text key={i} style={{ color: c.syntax[part.kind] }}>
                {part.text}
              </Text>
            ) : (
              <Fragment key={i}>{part.text}</Fragment>
            )
          )}
        </Text>
      </ScrollView>
      <View style={s.codeActions}>
        {run && <Button label="Run" onPress={run} size="sm" />}
        <Button
          label="Copy"
          onPress={() => copy(code)}
          size="sm"
          variant="outline"
        />
      </View>
    </View>
  );
}

/* --------------------------------- Buttons -------------------------------- */

/**
 * rayanstudio's `Button`: a superellipse pill in Google Sans medium with a
 * hairline border; `default` is the primary, dropped to 65% in dark mode.
 */
export function Button({
  label,
  onPress,
  variant = 'default',
  size = 'md',
}: {
  label: string;
  onPress?: () => void;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md';
}) {
  const { c } = useSite();
  const filled = variant === 'default';
  return (
    <Pressable
      onPress={onPress}
      {...data({ pill: '', press: '' })}
      style={({ hovered }: WebPressState) => [
        size === 'sm' ? s.buttonSm : s.button,
        {
          borderColor: filled ? 'transparent' : c.border,
          backgroundColor: filled ? c.fill : hovered ? c.code : c.bg,
          opacity: filled && hovered ? 0.9 : 1,
        },
      ]}
    >
      <Text
        style={[
          size === 'sm' ? s.buttonTextSm : s.buttonText,
          { color: filled ? '#ffffff' : c.fg },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ---------------------------------- Props --------------------------------- */

export interface PropRow {
  name: string;
  type: string;
  default?: string;
  children: ReactNode;
}

/** a props table that reads as a list on a phone */
export function Props({ rows }: { rows: PropRow[] }) {
  const { c } = useSite();
  return (
    <View
      {...data({ squircle: '2xl' })}
      style={[s.props, { borderColor: c.border, backgroundColor: c.card }]}
    >
      {rows.map((row, i) => (
        <View
          key={row.name}
          style={[
            s.prop,
            i > 0 && { borderTopWidth: 0.5, borderColor: c.border },
          ]}
        >
          <View style={s.propHead}>
            <Text style={[s.propName, { color: c.fg }]}>{row.name}</Text>
            <Text style={[s.propType, { color: c.muted }]}>{row.type}</Text>
            {row.default !== undefined && (
              <Text style={[s.propType, { color: c.subtle }]}>
                = {row.default}
              </Text>
            )}
          </View>
          <Text style={[s.propDesc, { color: c.muted }]}>{row.children}</Text>
        </View>
      ))}
    </View>
  );
}

/* --------------------------------- Controls ------------------------------- */

export function Chip({
  label,
  active,
  onPress,
  style,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useSite();
  return (
    <Pressable
      onPress={onPress}
      {...data({ pill: '', press: '' })}
      style={({ hovered }: WebPressState) => [
        s.chip,
        {
          borderColor: active ? 'transparent' : c.border,
          backgroundColor: active ? c.fill : hovered ? c.code : 'transparent',
        },
        style,
      ]}
    >
      <Text style={[s.chipText, { color: active ? '#ffffff' : c.fg }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <View style={s.row}>{children}</View>;
}

/** rayanstudio's micro label: mono, spaced, upper-case */
export function Label({ children }: { children: ReactNode }) {
  const { c } = useSite();
  return <Text style={[s.label, { color: c.muted }]}>{children}</Text>;
}

/** a raised block with a squircle corner */
export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useSite();
  return (
    <View
      {...data({ squircle: '2xl' })}
      style={[
        s.card,
        { backgroundColor: c.card, borderColor: c.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export const text = (style: TextStyle): TextStyle => ({
  fontFamily: FONT,
  ...style,
});

const s = StyleSheet.create({
  flex: { flex: 1 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eyebrowText: { fontFamily: MONO, fontSize: 13, letterSpacing: 0.4 },
  h1Block: { gap: 12, marginTop: 48, marginBottom: 10 },
  h1: {
    fontFamily: DISPLAY,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '600',
  },
  h2: {
    fontFamily: DISPLAY,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
    marginTop: 40,
    marginBottom: 10,
  },
  lead: text({
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
    marginBottom: 8,
  }),
  p: text({ fontSize: 15, lineHeight: 25, marginVertical: 6 }),
  strong: text({ fontWeight: '600' }),
  inlineCode: {
    fontFamily: MONO,
    fontSize: 13.5,
    borderRadius: 6,
    paddingHorizontal: 5,
  },
  link: text({ fontWeight: '500' }),
  list: { marginVertical: 6, gap: 2 },
  listItem: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  bullet: { width: 5, height: 5, borderRadius: 3, marginTop: 16 },
  code: {
    borderWidth: 0.5,
    borderRadius: radius.xl,
    marginVertical: 14,
    overflow: 'hidden',
  },
  codeScroll: { padding: 18, paddingRight: 140 },
  codeText: { fontFamily: MONO, fontSize: 13, lineHeight: 21 },
  codeActions: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    gap: 6,
  },
  button: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 0.65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSm: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 0.65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: text({ fontSize: 14, fontWeight: '500' }),
  buttonTextSm: text({ fontSize: 12, fontWeight: '500' }),
  props: {
    borderWidth: 0.5,
    borderRadius: radius['2xl'],
    marginVertical: 14,
    overflow: 'hidden',
  },
  prop: { paddingHorizontal: 18, paddingVertical: 15, gap: 6 },
  propHead: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    columnGap: 10,
  },
  propName: { fontFamily: MONO, fontSize: 13.5, fontWeight: '500' },
  propType: { fontFamily: MONO, fontSize: 12.5 },
  propDesc: text({ fontSize: 14, lineHeight: 21 }),
  chip: {
    height: 34,
    borderWidth: 0.65,
    borderRadius: 999,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  chipText: text({ fontSize: 13.5, fontWeight: '500' }),
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  label: {
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginTop: 22,
    marginBottom: 10,
  },
  card: {
    borderWidth: 0.5,
    borderRadius: radius['2xl'],
    padding: 22,
  },
});
