import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { SileoPosition } from './sileo';

/* --------------------------------- Palette -------------------------------- */

/* rayanstudio's tokens: shadcn zinc with its blue primary */
export const palettes = {
  light: {
    bg: '#ffffff',
    fg: '#09090b',
    card: '#ffffff',
    muted: '#71717b',
    subtle: '#a1a1aa',
    border: '#e4e4e7',
    code: '#f4f4f5',
    accent: '#155dfc',
    /** a filled primary surface */
    fill: '#155dfc',
    syntax: {
      keyword: '#a626a4',
      string: '#3a8a2e',
      comment: '#a0a1a7',
      number: '#c18401',
      tag: '#0184bc',
    },
  },
  dark: {
    bg: '#09090b',
    fg: '#fafafa',
    card: '#18181b',
    muted: '#a1a1a1',
    subtle: '#52525b',
    border: 'rgba(255, 255, 255, 0.1)',
    code: '#131316',
    accent: '#2b7fff',
    /* rayanstudio drops filled primaries to 65% in dark mode */
    fill: '#1f56aa',
    syntax: {
      keyword: '#c678dd',
      string: '#98c379',
      comment: '#5c6370',
      number: '#d19a66',
      tag: '#61afef',
    },
  },
};

export type Palette = (typeof palettes)['light'];
export type Scheme = 'light' | 'dark';

export const FONT = 'Google Sans';
export const DISPLAY = 'Bricolage Grotesque';
export const MONO = 'Google Sans Code';

/* ---------------------------------- State --------------------------------- */

/** what the playground can change on the one Toaster the site mounts */
export interface ToasterSettings {
  position: SileoPosition;
  brand: boolean;
}

interface SiteState {
  scheme: Scheme;
  c: Palette;
  toggleScheme: () => void;
  toaster: ToasterSettings;
  setToaster: (next: Partial<ToasterSettings>) => void;
}

const SiteContext = createContext<SiteState | null>(null);

const STORAGE_KEY = 'sileo-native-scheme';

/*
 * Dark by default, as rayanstudio is. The static HTML is rendered dark and so
 * is the first client render, so hydration matches; a saved choice applies
 * right after.
 */
export function SiteProvider({ children }: { children: ReactNode }) {
  const [scheme, setScheme] = useState<Scheme>('dark');
  const [toaster, setToasterState] = useState<ToasterSettings>({
    position: 'top-center',
    brand: false,
  });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') setScheme(saved);
    } catch {}
  }, []);

  const value = useMemo<SiteState>(
    () => ({
      scheme,
      c: palettes[scheme],
      toggleScheme: () => {
        const next = scheme === 'dark' ? 'light' : 'dark';
        setScheme(next);
        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {}
      },
      toaster,
      setToaster: (next) => setToasterState((prev) => ({ ...prev, ...next })),
    }),
    [scheme, toaster]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const value = useContext(SiteContext);
  if (!value) throw new Error('useSite() needs <SiteProvider>.');
  return value;
}
