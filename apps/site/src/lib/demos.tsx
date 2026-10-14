import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  sileo,
  type SileoPosition,
  type SileoToastTheme,
  useSileoTheme,
} from './sileo';
import Svg, { Circle, Line, Path } from 'react-native-svg';

/* ------------------------------- Demo icons -------------------------------- */

interface IconProps {
  color?: string;
}

const Icon = ({ color, children }: IconProps & { children: ReactNode }) => (
  <Svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </Svg>
);

export const RocketIcon = ({ color }: IconProps) => (
  <Icon color={color}>
    <Path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <Path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <Path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <Path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </Icon>
);

export const ArrowUpIcon = ({ color }: IconProps) => (
  <Icon color={color}>
    <Path d="m5 12 7-7 7 7" />
    <Path d="M12 19V5" />
  </Icon>
);

export const FileIcon = ({ color }: IconProps) => (
  <Icon color={color}>
    <Path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <Path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </Icon>
);

/* --------------------------------- Ink ------------------------------------ */

const isDark = (hex: string) => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m?.[1]) return false;
  const n = parseInt(m[1], 16);
  const lum =
    0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
  return lum < 128;
};

/** strong text for whatever surface the toast is drawn on */
const inkOf = (t: SileoToastTheme) =>
  t.appearance === 'glass'
    ? t.glass.colorScheme === 'dark'
      ? '#ffffff'
      : '#000000'
    : isDark(t.fill)
      ? '#ffffff'
      : '#000000';

/* ------------------------------ Flight toast ------------------------------- */

/**
 * The booking card from the web demo, in views. Its colors come from
 * `useSileoTheme()`, so it reads on any fill, theme, or glass.
 */
function FlightToast() {
  const theme = useSileoTheme();
  const ink = inkOf(theme);
  const green = theme.stateColors.success;
  return (
    <View style={flight.root}>
      <View style={flight.row}>
        <Text style={[flight.airline, { color: ink }]}>UNITED</Text>
        <Text style={[flight.muted, { color: theme.text }]}>UA13A</Text>
      </View>

      <View style={flight.row}>
        <Text style={[flight.code, { color: ink }]}>DEL</Text>
        <Svg width={150} height={24} viewBox="0 0 150 24">
          <Line
            x1={4}
            x2={146}
            y1={12}
            y2={12}
            stroke={green}
            strokeOpacity={0.5}
            strokeWidth={2}
            strokeDasharray="3.5 6.5"
            strokeLinecap="round"
          />
          <Line
            x1={4}
            x2={52}
            y1={12}
            y2={12}
            stroke={green}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <Circle cx={52} cy={12} r={5.4} fill={ink} fillOpacity={0.15} />
          <Circle cx={52} cy={12} r={3.2} fill={green} />
        </Svg>
        <Text style={[flight.code, { color: ink }]}>SFO</Text>
      </View>

      <View style={[flight.row, flight.bottom]}>
        <View style={flight.meta}>
          <Text style={[flight.onTime, { color: green }]}>On Time</Text>
          <Text style={[flight.pnr, { color: ink }]}>
            <Text style={{ color: theme.text }}>PNR </Text>EC2QW4
          </Text>
        </View>
        <View style={flight.seat}>
          <Text style={flight.seatText}>32K</Text>
        </View>
      </View>
    </View>
  );
}

const flight = StyleSheet.create({
  root: { gap: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  airline: { fontSize: 15, fontWeight: '800', letterSpacing: 1.5 },
  muted: { fontSize: 14, fontWeight: '500' },
  code: { fontSize: 24, fontWeight: '500', letterSpacing: -0.5 },
  bottom: { alignItems: 'flex-end' },
  meta: { gap: 6 },
  onTime: { fontSize: 14, fontWeight: '600' },
  pnr: { fontSize: 14, fontWeight: '500' },
  seat: {
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  seatText: { fontSize: 14, fontWeight: '600', color: '#000' },
});

/* ------------------------------- Fire toast -------------------------------- */

export const TOAST_TYPES = [
  'success',
  'error',
  'warning',
  'info',
  'action',
  'custom-icon',
  'promise',
  'promise-error',
  'plain',
  'buttons-2',
  'buttons-4',
  'buttons-column',
  'custom-style',
  'sticky',
  'manual',
] as const;

export type ToastType = (typeof TOAST_TYPES)[number];

export const BUTTONS: { label: string; type: ToastType }[] = [
  { label: 'Success', type: 'success' },
  { label: 'Error', type: 'error' },
  { label: 'Warning', type: 'warning' },
  { label: 'Info', type: 'info' },
  { label: 'Action', type: 'action' },
  { label: 'Icon', type: 'custom-icon' },
  { label: 'Promise', type: 'promise' },
  { label: 'Promise ✕', type: 'promise-error' },
  { label: 'Title only', type: 'plain' },
  { label: '2 buttons', type: 'buttons-2' },
  { label: '4 buttons', type: 'buttons-4' },
  { label: 'Stacked', type: 'buttons-column' },
  { label: 'Custom style', type: 'custom-style' },
  { label: 'Sticky', type: 'sticky' },
  { label: 'No autopilot', type: 'manual' },
];

interface FireOptions {
  position: SileoPosition;
  roundness: number;
}

export function fireToast(
  type: ToastType,
  { position, roundness }: FireOptions
) {
  const base = { position, roundness };
  switch (type) {
    case 'success':
      sileo.success({
        ...base,
        title: 'Changes Saved',
        description:
          'Changes saved successfully to the database. Please refresh the page to see the changes.',
      });
      break;
    case 'error':
      sileo.error({
        ...base,
        title: 'Something Went Wrong',
        description:
          "We're having trouble saving your changes to the server. Please try again in a few minutes.",
      });
      break;
    case 'warning':
      sileo.warning({
        ...base,
        title: 'Storage Almost Full',
        description:
          "You've used 95% of your available storage. Please upgrade your plan to continue.",
      });
      break;
    case 'info':
      sileo.action({
        ...base,
        icon: <ArrowUpIcon />,
        title: 'New Update Available',
        description:
          'Version 2.0 is now available. Please update your app to continue using the latest features.',
      });
      break;
    case 'action':
      // the web shape, unchanged: one `button` with `onClick`
      sileo.action({
        ...base,
        title: 'File Uploaded',
        icon: <FileIcon />,
        description: 'Your file has been uploaded. Share it with your team?',
        button: {
          title: 'Share Now',
          onClick: () => sileo.success({ ...base, title: 'Link Copied' }),
        },
      });
      break;
    case 'custom-icon':
      sileo.success({
        ...base,
        title: 'Deployment Started',
        icon: <RocketIcon />,
        description: 'Your app is being deployed to production.',
      });
      break;
    case 'promise':
      sileo.promise(
        new Promise<void>((resolve) => setTimeout(() => resolve(), 2500)),
        {
          loading: { ...base, title: 'Booking Flight' },
          success: {
            ...base,
            title: 'Booking Confirmed',
            description: <FlightToast />,
            buttons: [
              {
                title: 'View Details',
                onPress: () =>
                  sileo.success({ ...base, title: 'Details Viewed' }),
              },
              {
                title: 'Later',
                variant: 'neutral',
                dismiss: true,
                onPress: () => {},
              },
            ],
          },
          error: { ...base, title: 'Booking Failed' },
          position,
        }
      );
      break;
    case 'promise-error':
      sileo
        .promise(
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('The seat was taken.')), 2000)
          ),
          {
            loading: { ...base, title: 'Booking Flight' },
            success: { ...base, title: 'Booking Confirmed' },
            error: (err) => ({
              ...base,
              title: 'Booking Failed',
              description: (err as Error).message,
              buttons: [
                {
                  title: 'Try Again',
                  variant: 'error',
                  onPress: () => fireToast('promise', { position, roundness }),
                },
              ],
            }),
            position,
          }
        )
        .catch(() => {});
      break;
    case 'plain':
      sileo.info({ ...base, title: 'Copied to clipboard' });
      break;
    case 'buttons-2':
      sileo.warning({
        ...base,
        title: 'Unsaved Changes',
        description: 'You have edits that have not been saved yet.',
        duration: 10000,
        buttons: [
          {
            title: 'Save',
            variant: 'success',
            dismiss: true,
            onPress: () => sileo.success({ ...base, title: 'Saved' }),
          },
          {
            title: 'Discard',
            variant: 'error',
            dismiss: true,
            onPress: () => sileo.error({ ...base, title: 'Discarded' }),
          },
        ],
      });
      break;
    case 'buttons-4':
      sileo.info({
        ...base,
        title: 'How was your ride?',
        description: 'Tap one to rate your trip with Alex.',
        duration: 10000,
        buttons: [
          {
            title: 'Great',
            variant: 'success',
            dismiss: true,
            onPress: () => {},
          },
          { title: 'Okay', variant: 'info', dismiss: true, onPress: () => {} },
          {
            title: 'Meh',
            variant: 'warning',
            dismiss: true,
            onPress: () => {},
          },
          { title: 'Bad', variant: 'error', dismiss: true, onPress: () => {} },
        ],
      });
      break;
    case 'buttons-column':
      sileo.action({
        ...base,
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
      });
      break;
    case 'custom-style':
      sileo.action({
        ...base,
        title: 'New Sale',
        fill: '#000000',
        description: 'Someone just bought the Pro plan.',
        styles: {
          title: { color: '#ffffff' },
          description: { color: 'rgba(255, 255, 255, 0.75)' },
          badge: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
          button: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
          buttonText: { color: '#ffffff' },
        },
        button: { title: 'View Order', onPress: () => {} },
      });
      break;
    case 'sticky':
      sileo.warning({
        ...base,
        title: 'Offline',
        description:
          'Tap to expand, swipe to dismiss. This one stays until you do.',
        duration: null,
      });
      break;
    case 'manual':
      sileo.success({
        ...base,
        title: 'Manual only',
        description: 'Expand and collapse are disabled. Tap to open.',
        autopilot: false,
      });
      break;
  }
}
