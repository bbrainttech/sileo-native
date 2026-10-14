import { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { sileo, type SileoAppearance, type SileoPosition } from 'sileo-native';
import type { ToastType } from './demos';

/*
 * Dev-only: drive the playground from deep links, e.g.
 *   xcrun simctl openurl booted "exp://<host>:8081/--/fire/success"
 */
interface Controls {
  fire: (type: ToastType) => void;
  setPosition: (p: SileoPosition) => void;
  setTheme: (t: 'light' | 'dark' | 'system' | 'brand') => void;
  setRoundness: (r: number) => void;
  setAppearance: (a: SileoAppearance) => void;
  setModal: (mode: 'nested' | 'overlay' | null) => void;
}

export function useAutomation(controls: Controls) {
  const ref = useRef(controls);
  ref.current = controls;

  useEffect(() => {
    if (!__DEV__) return;
    const handle = (url: string | null) => {
      if (!url) return;
      const path = url.split('/--/')[1];
      if (!path) return;
      const [cmd, arg] = path.split('/');
      const c = ref.current;
      switch (cmd) {
        case 'fire':
          c.fire(arg as ToastType);
          break;
        case 'position':
          c.setPosition(arg as SileoPosition);
          break;
        case 'theme':
          c.setTheme(arg as 'light' | 'dark' | 'system' | 'brand');
          break;
        case 'roundness':
          c.setRoundness(Number(arg));
          break;
        case 'appearance':
          c.setAppearance(arg as SileoAppearance);
          break;
        case 'modal':
          c.setModal(arg === 'nested' || arg === 'overlay' ? arg : null);
          break;
        case 'dismiss':
          sileo.dismiss('sileo-default');
          break;
        case 'clear':
          sileo.clear();
          break;
      }
    };
    const sub = Linking.addEventListener('url', (e) => handle(e.url));
    return () => sub.remove();
  }, []);
}
