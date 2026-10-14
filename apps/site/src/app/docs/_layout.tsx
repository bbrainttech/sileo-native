import { Link, Slot, usePathname } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MAX_WIDTH } from '../../components/shell';
import { FONT, MONO, useSite } from '../../lib/site';
import { data } from '../../lib/web';

const DOCS = [
  { href: '/docs', title: 'Getting started' },
  { href: '/docs/api', title: 'API' },
  { href: '/docs/toaster', title: 'Toaster' },
  { href: '/docs/buttons', title: 'Buttons' },
  { href: '/docs/theming', title: 'Theming' },
  { href: '/docs/glass', title: 'Liquid Glass' },
  { href: '/docs/modals', title: 'Modals' },
  { href: '/docs/web', title: 'Web' },
] as const;

function DocLink({ href, title }: (typeof DOCS)[number]) {
  const { c } = useSite();
  const active = usePathname() === href;
  return (
    <Link
      href={href}
      {...data({ pill: '' })}
      style={[
        styles.link,
        {
          color: active ? c.fg : c.muted,
          backgroundColor: active ? c.code : 'transparent',
        },
      ]}
    >
      {title}
    </Link>
  );
}

/*
 * A sidebar from 900px, a row of tabs below it. Both render and CSS picks
 * one by width, so the page is laid out right before any JavaScript runs.
 */
export default function DocsLayout() {
  const { c } = useSite();
  return (
    <View style={styles.wide}>
      <View
        {...data({ docsSidebar: '' })}
        style={[styles.sidebar, { borderColor: c.border }]}
      >
        <Text style={[styles.heading, { color: c.muted }]}>~/docs</Text>
        {DOCS.map((d) => (
          <DocLink key={d.href} {...d} />
        ))}
      </View>
      <View style={styles.flex}>
        <View
          {...data({ docsTabs: '' })}
          style={[styles.tabs, { borderColor: c.border }]}
        >
          <ScrollView horizontal contentContainerStyle={styles.tabsInner}>
            {DOCS.map((d) => (
              <DocLink key={d.href} {...d} />
            ))}
          </ScrollView>
        </View>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wide: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  sidebar: {
    width: 220,
    paddingTop: 40,
    paddingHorizontal: 12,
    borderRightWidth: 0.65,
    gap: 2,
  },
  heading: {
    fontFamily: MONO,
    fontSize: 12.5,
    letterSpacing: 0.4,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  link: {
    fontFamily: FONT,
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  tabs: { borderBottomWidth: 0.65 },
  tabsInner: { paddingHorizontal: 12, paddingVertical: 8, gap: 2 },
});
