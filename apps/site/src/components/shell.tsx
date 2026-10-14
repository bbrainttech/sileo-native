import { Link, usePathname } from 'expo-router';
import Head from 'expo-router/head';
import type { ReactNode } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { DISPLAY, FONT, MONO, useSite } from '../lib/site';
import { data } from '../lib/web';

export const MAX_WIDTH = 1080;
export const GITHUB = 'https://github.com/bbrainttech/sileo-native';
export const STUDIO = 'https://rayanstudio.dev';

/* ---------------------------------- Logo ---------------------------------- */

/** rayanstudio's mark, a rule, then the project: a rayanstudio project */
export function Logo({ size = 26 }: { size?: number }) {
  const { c } = useSite();
  return (
    <View style={s.logo}>
      <Link href={STUDIO} target="_blank" accessibilityLabel="rayanstudio">
        <Image
          {...data({ invertDark: '' })}
          source={{ uri: '/rayanstudio.png' }}
          style={{ width: size, height: size }}
          accessibilityIgnoresInvertColors
        />
      </Link>
      <View
        style={[s.rule, { backgroundColor: c.subtle, height: size * 0.8 }]}
      />
      <Link href="/">
        <Text style={[s.wordmark, { color: c.fg, fontSize: size * 0.72 }]}>
          sileo-native
        </Text>
      </Link>
    </View>
  );
}

/* ----------------------------------- Nav ---------------------------------- */

function NavLink({ href, label }: { href: '/docs' | '/play'; label: string }) {
  const { c } = useSite();
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      {...data({ pill: '', hover: '', press: '', navLink: '' })}
      style={[
        s.pill,
        s.navText,
        {
          color: active ? c.fg : c.muted,
          backgroundColor: active ? c.code : 'transparent',
        },
      ]}
    >
      {label}
    </Link>
  );
}

function IconButton({
  label,
  onPress,
  href,
  children,
}: {
  label: string;
  onPress?: () => void;
  href?: string;
  children: ReactNode;
}) {
  const { c } = useSite();
  const body = (
    <View
      {...data({ pill: '', hover: '', press: '' })}
      style={[s.iconButton, { borderColor: c.border }]}
    >
      {children}
    </View>
  );
  return href ? (
    <Link
      href={href}
      target="_blank"
      accessibilityLabel={label}
      {...data({ hideSm: '' })}
    >
      {body}
    </Link>
  ) : (
    <Pressable onPress={onPress} accessibilityLabel={label}>
      {body}
    </Pressable>
  );
}

export function Nav() {
  const { c, scheme, toggleScheme } = useSite();
  return (
    <View style={[s.nav, { borderColor: c.border, backgroundColor: c.bg }]}>
      <View {...data({ navInner: '' })} style={s.navInner}>
        <Logo />
        <View style={s.navRight}>
          <NavLink href="/docs" label="Docs" />
          <NavLink href="/play" label="Playground" />
          <IconButton label="GitHub" href={GITHUB}>
            <Svg width={15} height={15} viewBox="0 0 24 24" fill={c.fg}>
              <Path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3" />
            </Svg>
          </IconButton>
          <IconButton
            label={`Switch to ${scheme === 'dark' ? 'light' : 'dark'} mode`}
            onPress={toggleScheme}
          >
            <Svg
              width={15}
              height={15}
              viewBox="0 0 24 24"
              fill="none"
              stroke={c.fg}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {scheme === 'dark' ? (
                <>
                  <Circle cx="12" cy="12" r="4" />
                  <Path d="M12 2v2M12 20v2m-7.07-2.93 1.41-1.41M17.66 6.34l1.41-1.41M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41" />
                </>
              ) : (
                <Path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              )}
            </Svg>
          </IconButton>
        </View>
      </View>
    </View>
  );
}

/* --------------------------------- Footer --------------------------------- */

function FooterLink({ href, label }: { href: string; label: string }) {
  const { c } = useSite();
  const external = href.startsWith('http');
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      {...data({ pill: '', hover: '', press: '' })}
      style={[s.pill, s.footerLink, { color: c.muted }]}
    >
      {label}
    </Link>
  );
}

export function Footer() {
  const { c } = useSite();
  return (
    <View style={s.footer}>
      <View style={s.footerTop}>
        <Logo size={24} />
        <Text style={[s.bio, { color: c.muted }]}>
          The toast from sileo, ported to React Native. Built in the open by
          rayanstudio.
        </Text>
        <View style={s.footerLinks}>
          <FooterLink href="/docs" label="Docs" />
          <FooterLink href="/play" label="Playground" />
          <FooterLink href={GITHUB} label="GitHub" />
          <FooterLink href="https://github.com/hiaaryan/sileo" label="sileo" />
          <FooterLink href={STUDIO} label="rayanstudio.dev" />
        </View>
      </View>
      <View style={[s.bottomBar, { borderColor: c.border }]}>
        <Text style={[s.micro, { color: c.muted }]}>
          © {new Date().getFullYear()} rayanstudio · MIT License
        </Text>
        <Text style={[s.micro, { color: c.muted }]}>
          A native port of sileo by hiaaryan
        </Text>
      </View>
      <View style={s.wordmarkClip} pointerEvents="none">
        <Text
          {...data({ wordmark: '' })}
          aria-hidden
          style={[s.bigWordmark, { color: c.fg }]}
        >
          sileo-native
        </Text>
      </View>
    </View>
  );
}

/* ---------------------------------- Page ---------------------------------- */

/** a scrolling page with its own title, centred to `width` */
export function Page({
  title,
  width = 768,
  children,
}: {
  title?: string;
  width?: number;
  children: ReactNode;
}) {
  return (
    <ScrollView contentContainerStyle={s.page}>
      <Head>
        <title>{title ? `${title} — sileo-native` : 'sileo-native'}</title>
      </Head>
      <View style={[s.content, { maxWidth: width }]}>{children}</View>
      <View style={[s.content, { maxWidth: width }]}>
        <Footer />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  logo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rule: { width: 1 },
  wordmark: {
    fontFamily: DISPLAY,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  nav: { borderBottomWidth: 0.65, zIndex: 10 },
  navInner: {
    height: 60,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pill: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
  },
  navText: { fontFamily: FONT, fontSize: 14, fontWeight: '500' },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 0.65,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  page: { flexGrow: 1, paddingHorizontal: 20 },
  content: { width: '100%', alignSelf: 'center' },
  footer: { marginTop: 96, overflow: 'hidden' },
  footerTop: { alignItems: 'center', gap: 14, paddingBottom: 28 },
  bio: {
    fontFamily: FONT,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 380,
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 2,
  },
  footerLink: { fontFamily: FONT, fontSize: 13.5, fontWeight: '500' },
  bottomBar: {
    borderTopWidth: 0.65,
    paddingVertical: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  micro: {
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  wordmarkClip: { height: 92, overflow: 'hidden', alignItems: 'center' },
  bigWordmark: {
    fontFamily: DISPLAY,
    fontWeight: '700',
    fontSize: 112,
    lineHeight: 120,
    letterSpacing: -2,
  },
});
