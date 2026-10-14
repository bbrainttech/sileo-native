import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Page } from '../components/shell';
import { Chip, H1, Label, Lead, Row } from '../components/ui';
import { BUTTONS, fireToast } from '../lib/demos';
import { SILEO_POSITIONS, sileo } from '../lib/sileo';
import { FONT, useSite } from '../lib/site';

const ROUNDNESS = [0, 8, 12, 16, 20];

export default function Playground() {
  const { c, toaster, setToaster } = useSite();
  const [roundness, setRoundness] = useState(16);

  return (
    <Page title="Playground">
      <H1 path="playground">Playground</H1>
      <Lead>
        Pick a position, tap any type to fire it live. Tap a toast to open it,
        swipe it to dismiss.
      </Lead>

      <Label>Position</Label>
      <Row>
        {SILEO_POSITIONS.map((pos) => (
          <Chip
            key={pos}
            label={pos}
            active={toaster.position === pos}
            onPress={() => setToaster({ position: pos })}
          />
        ))}
      </Row>

      <Label>Theme</Label>
      <Row>
        <Chip
          label="default"
          active={!toaster.brand}
          onPress={() => setToaster({ brand: false })}
        />
        <Chip
          label="brand"
          active={toaster.brand}
          onPress={() => setToaster({ brand: true })}
        />
      </Row>

      <Label>Roundness</Label>
      <Row>
        {ROUNDNESS.map((r) => (
          <Chip
            key={r}
            label={String(r)}
            active={roundness === r}
            onPress={() => setRoundness(r)}
          />
        ))}
      </Row>

      <View style={[styles.divider, { borderColor: c.border }]} />

      <Label>Fire</Label>
      <Row>
        {BUTTONS.map((b) => (
          <Chip
            key={b.type}
            label={b.label}
            onPress={() =>
              fireToast(b.type, { position: toaster.position, roundness })
            }
          />
        ))}
      </Row>

      <Label>Control</Label>
      <Row>
        <Chip label="Dismiss" onPress={() => sileo.dismiss('sileo-default')} />
        <Chip label="Clear all" onPress={() => sileo.clear()} />
      </Row>

      <Text style={[styles.note, { color: c.subtle }]}>
        Liquid Glass needs iOS 26, so the web shows the solid toast. Run the
        example app in Expo Go to try glass.
      </Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  divider: { borderTopWidth: 1, borderStyle: 'dashed', marginTop: 28 },
  note: { fontFamily: FONT, fontSize: 13, marginTop: 28 },
});
