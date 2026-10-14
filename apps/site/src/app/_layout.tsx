import { Slot } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { LiveToaster } from '../components/live-toaster';
import { Nav } from '../components/shell';
import { SiteProvider, useSite } from '../lib/site';
import { data } from '../lib/web';

function Shell() {
  const { c, scheme } = useSite();
  return (
    <View
      {...data({ theme: scheme })}
      style={[styles.root, { backgroundColor: c.bg }]}
    >
      <Nav />
      <Slot />
      <LiveToaster />
    </View>
  );
}

export default function Layout() {
  return (
    <SiteProvider>
      <Shell />
    </SiteProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
