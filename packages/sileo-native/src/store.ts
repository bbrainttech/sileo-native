import {
  AUTO_COLLAPSE_DELAY,
  AUTO_EXPAND_DELAY,
  DEFAULT_TOAST_DURATION,
  EXIT_DURATION,
} from './constants';
import type { SileoOptions, SileoPosition, SileoState } from './types';

/* ---------------------------------- Types --------------------------------- */

export interface InternalSileoOptions extends SileoOptions {
  id?: string;
  state?: SileoState;
}

export interface SileoItem extends InternalSileoOptions {
  id: string;
  instanceId: string;
  exiting?: boolean;
  autoExpandDelayMs?: number;
  autoCollapseDelayMs?: number;
}

/* ------------------------------ Global State ------------------------------ */

type SileoListener = () => void;

export const DEFAULT_POSITION: SileoPosition = 'top-center';

export const store = {
  toasts: [] as SileoItem[],
  listeners: new Set<SileoListener>(),
  position: DEFAULT_POSITION as SileoPosition,
  options: undefined as Partial<SileoOptions> | undefined,

  emit() {
    for (const fn of this.listeners) fn();
  },

  update(fn: (prev: SileoItem[]) => SileoItem[]) {
    this.toasts = fn(this.toasts);
    this.emit();
  },

  /*
   * The pair `useSyncExternalStore` needs. The web Toaster re-reads the store
   * by hand after subscribing to cover a write landing between its render and
   * its subscription; `useSyncExternalStore` does that check itself.
   */
  subscribe(listener: SileoListener) {
    store.listeners.add(listener);
    return () => {
      store.listeners.delete(listener);
    };
  },

  getSnapshot() {
    return store.toasts;
  },
};

/* --------------------------------- Hosts ---------------------------------- */

/*
 * Every mounted Toaster is a host, and only the newest one shows toasts.
 *
 * A native modal is its own window above the app, so a Toaster at the root
 * draws underneath it. Mounting a second Toaster inside the modal moves the
 * toasts there for as long as the modal is open, and they come back to the
 * root when it closes. The web build has one global store and two Toasters
 * render every toast twice; this keeps the one store and gives it one
 * renderer at a time.
 */

type HostListener = () => void;

let hostCounter = 0;

export const hosts = {
  stack: [] as number[],
  listeners: new Set<HostListener>(),

  add() {
    const id = ++hostCounter;
    hosts.stack = [...hosts.stack, id];
    for (const fn of hosts.listeners) fn();
    return id;
  },

  remove(id: number) {
    hosts.stack = hosts.stack.filter((h) => h !== id);
    for (const fn of hosts.listeners) fn();
  },

  subscribe(listener: HostListener) {
    hosts.listeners.add(listener);
    return () => {
      hosts.listeners.delete(listener);
    };
  },

  /** the host that shows toasts: the newest still mounted */
  getActive(): number | undefined {
    return hosts.stack[hosts.stack.length - 1];
  },
};

let idCounter = 0;
const generateId = () =>
  `${++idCounter}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const timeoutKey = (t: SileoItem) => `${t.id}:${t.instanceId}`;

/* ------------------------------- Toast API -------------------------------- */

export const dismissToast = (id: string) => {
  const item = store.toasts.find((t) => t.id === id);
  if (!item || item.exiting) return;

  store.update((prev) =>
    prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
  );

  /*
   * Remove the instance that was dismissed, not whatever holds the id by the
   * time this fires. Every toast shares `sileo-default` unless told otherwise,
   * so a toast fired during the exit takes the same id, and removing by id
   * alone would take the new toast down with the old one.
   */
  setTimeout(
    () =>
      store.update((prev) =>
        prev.filter((t) => t.instanceId !== item.instanceId)
      ),
    EXIT_DURATION
  );
};

export const resolveAutopilot = (
  opts: InternalSileoOptions,
  duration: number | null
): { expandDelayMs?: number; collapseDelayMs?: number } => {
  if (opts.autopilot === false || !duration || duration <= 0) return {};
  const cfg = typeof opts.autopilot === 'object' ? opts.autopilot : undefined;
  const clamp = (v: number) => Math.min(duration, Math.max(0, v));
  return {
    expandDelayMs: clamp(cfg?.expand ?? AUTO_EXPAND_DELAY),
    collapseDelayMs: clamp(cfg?.collapse ?? AUTO_COLLAPSE_DELAY),
  };
};

const mergeOptions = (options: InternalSileoOptions) => ({
  ...store.options,
  ...options,
  styles: { ...store.options?.styles, ...options.styles },
});

const buildSileoItem = (
  merged: InternalSileoOptions,
  id: string,
  fallbackPosition?: SileoPosition
): SileoItem => {
  const duration = merged.duration ?? DEFAULT_TOAST_DURATION;
  const auto = resolveAutopilot(merged, duration);
  return {
    ...merged,
    id,
    instanceId: generateId(),
    position: merged.position ?? fallbackPosition ?? store.position,
    autoExpandDelayMs: auto.expandDelayMs,
    autoCollapseDelayMs: auto.collapseDelayMs,
  };
};

const createToast = (options: InternalSileoOptions) => {
  const live = store.toasts.filter((t) => !t.exiting);
  const merged = mergeOptions(options);

  const id = merged.id ?? 'sileo-default';
  const prev = live.find((t) => t.id === id);
  const item = buildSileoItem(merged, id, prev?.position);

  if (prev) {
    store.update((p) => p.map((t) => (t.id === id ? item : t)));
  } else {
    store.update((p) => [...p.filter((t) => t.id !== id), item]);
  }
  return { id, duration: merged.duration ?? DEFAULT_TOAST_DURATION };
};

const updateToast = (id: string, options: InternalSileoOptions) => {
  const existing = store.toasts.find((t) => t.id === id);
  if (!existing) return;

  const item = buildSileoItem(mergeOptions(options), id, existing.position);
  store.update((prev) => prev.map((t) => (t.id === id ? item : t)));
};

export interface SileoPromiseOptions<T = unknown> {
  loading: SileoOptions;
  success: SileoOptions | ((data: T) => SileoOptions);
  error: SileoOptions | ((err: unknown) => SileoOptions);
  action?: SileoOptions | ((data: T) => SileoOptions);
  position?: SileoPosition;
}

export const sileo = {
  show: (opts: SileoOptions) => createToast({ ...opts, state: opts.type }).id,
  success: (opts: SileoOptions) =>
    createToast({ ...opts, state: 'success' }).id,
  error: (opts: SileoOptions) => createToast({ ...opts, state: 'error' }).id,
  warning: (opts: SileoOptions) =>
    createToast({ ...opts, state: 'warning' }).id,
  info: (opts: SileoOptions) => createToast({ ...opts, state: 'info' }).id,
  action: (opts: SileoOptions) => createToast({ ...opts, state: 'action' }).id,

  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    opts: SileoPromiseOptions<T>
  ): Promise<T> => {
    const { id } = createToast({
      ...opts.loading,
      state: 'loading',
      duration: null,
      position: opts.position ?? opts.loading.position,
    });

    const p = typeof promise === 'function' ? promise() : promise;

    p.then((data) => {
      if (opts.action) {
        const actionOpts =
          typeof opts.action === 'function' ? opts.action(data) : opts.action;
        updateToast(id, { ...actionOpts, state: 'action', id });
      } else {
        const successOpts =
          typeof opts.success === 'function'
            ? opts.success(data)
            : opts.success;
        updateToast(id, { ...successOpts, state: 'success', id });
      }
    }).catch((err) => {
      const errorOpts =
        typeof opts.error === 'function' ? opts.error(err) : opts.error;
      updateToast(id, { ...errorOpts, state: 'error', id });
    });

    return p;
  },

  dismiss: dismissToast,

  clear: (position?: SileoPosition) =>
    store.update((prev) =>
      position ? prev.filter((t) => t.position !== position) : []
    ),
};
