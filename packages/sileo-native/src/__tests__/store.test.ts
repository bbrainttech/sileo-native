import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import {
  AUTO_COLLAPSE_DELAY,
  AUTO_EXPAND_DELAY,
  DEFAULT_TOAST_DURATION,
  EXIT_DURATION,
} from '../constants';
import { resolveAutopilot, sileo, store } from '../store';

/* promise callbacks run on microtasks, which fake timers leave alone */
const flush = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve();
};

beforeEach(() => {
  jest.useFakeTimers();
  store.toasts = [];
  store.position = 'top-center';
  store.options = undefined;
});

afterEach(() => {
  jest.useRealTimers();
});

describe('creating toasts', () => {
  it('gives every toast the shared default id and the matching state', () => {
    const id = sileo.error({ title: 'Nope' });
    expect(id).toBe('sileo-default');
    expect(store.toasts).toHaveLength(1);
    expect(store.toasts[0]).toMatchObject({ state: 'error', title: 'Nope' });
  });

  it('replaces the live toast under the same id instead of stacking', () => {
    sileo.success({ title: 'One' });
    const first = store.toasts[0]!.instanceId;
    sileo.info({ title: 'Two' });
    expect(store.toasts).toHaveLength(1);
    expect(store.toasts[0]).toMatchObject({ state: 'info', title: 'Two' });
    expect(store.toasts[0]!.instanceId).not.toBe(first);
  });

  it('keeps the position of the toast it replaces unless given one', () => {
    sileo.success({ title: 'One', position: 'bottom-left' });
    sileo.success({ title: 'Two' });
    expect(store.toasts[0]!.position).toBe('bottom-left');
    sileo.success({ title: 'Three', position: 'top-right' });
    expect(store.toasts[0]!.position).toBe('top-right');
  });

  it('falls back to the Toaster position', () => {
    store.position = 'bottom-center';
    sileo.success({ title: 'Hi' });
    expect(store.toasts[0]!.position).toBe('bottom-center');
  });

  it('merges Toaster options under the toast options, styles included', () => {
    store.options = { fill: '#000', styles: { title: { color: 'white' } } };
    sileo.success({ title: 'Hi', styles: { badge: { opacity: 0.5 } } });
    expect(store.toasts[0]).toMatchObject({
      fill: '#000',
      styles: { title: { color: 'white' }, badge: { opacity: 0.5 } },
    });
  });

  it('defaults `show` to no state, which the toast renders as success', () => {
    sileo.show({ title: 'Plain' });
    expect(store.toasts[0]!.state).toBeUndefined();
    sileo.show({ title: 'Typed', type: 'warning' });
    expect(store.toasts[0]!.state).toBe('warning');
  });
});

describe('autopilot', () => {
  it('uses the default delays', () => {
    expect(resolveAutopilot({}, DEFAULT_TOAST_DURATION)).toEqual({
      expandDelayMs: AUTO_EXPAND_DELAY,
      collapseDelayMs: AUTO_COLLAPSE_DELAY,
    });
  });

  it('clamps custom delays to the duration', () => {
    expect(
      resolveAutopilot({ autopilot: { expand: -5, collapse: 9000 } }, 3000)
    ).toEqual({ expandDelayMs: 0, collapseDelayMs: 3000 });
  });

  it('is off when disabled or when the toast is sticky', () => {
    expect(resolveAutopilot({ autopilot: false }, 6000)).toEqual({});
    expect(resolveAutopilot({}, null)).toEqual({});
    expect(resolveAutopilot({}, 0)).toEqual({});
  });

  it('is attached to the item', () => {
    sileo.success({ title: 'Hi', autopilot: { expand: 500, collapse: 3000 } });
    expect(store.toasts[0]).toMatchObject({
      autoExpandDelayMs: 500,
      autoCollapseDelayMs: 3000,
    });
  });
});

describe('dismissing', () => {
  it('marks the toast exiting, then removes it after the exit', () => {
    const id = sileo.success({ title: 'Bye' });
    sileo.dismiss(id);
    expect(store.toasts[0]!.exiting).toBe(true);
    jest.advanceTimersByTime(EXIT_DURATION);
    expect(store.toasts).toHaveLength(0);
  });

  it('ignores a toast that is already exiting', () => {
    const id = sileo.success({ title: 'Bye' });
    sileo.dismiss(id);
    const snapshot = store.toasts;
    sileo.dismiss(id);
    expect(store.toasts).toBe(snapshot);
  });

  it('does not take down a toast fired during the exit', () => {
    const id = sileo.success({ title: 'Old' });
    sileo.dismiss(id);
    sileo.success({ title: 'New' });
    jest.advanceTimersByTime(EXIT_DURATION);
    expect(store.toasts).toHaveLength(1);
    expect(store.toasts[0]).toMatchObject({ title: 'New' });
    expect(store.toasts[0]!.exiting).toBeFalsy();
  });

  it('clears everything, or one position', () => {
    sileo.success({ title: 'Top', position: 'top-center' });
    store.toasts = [
      ...store.toasts,
      { ...store.toasts[0]!, id: 'other', position: 'bottom-center' },
    ];
    sileo.clear('top-center');
    expect(store.toasts.map((t) => t.id)).toEqual(['other']);
    sileo.clear();
    expect(store.toasts).toHaveLength(0);
  });
});

describe('promise', () => {
  it('shows a sticky loading toast, then success', async () => {
    let resolve!: (v: { name: string }) => void;
    const p = new Promise<{ name: string }>((r) => (resolve = r));

    const returned = sileo.promise(p, {
      loading: { title: 'Saving' },
      success: (user) => ({ title: `Hi ${user.name}` }),
      error: { title: 'Failed' },
    });

    expect(returned).toBe(p);
    expect(store.toasts[0]).toMatchObject({
      state: 'loading',
      title: 'Saving',
      duration: null,
    });

    resolve({ name: 'Ada' });
    await flush();
    expect(store.toasts[0]).toMatchObject({
      state: 'success',
      title: 'Hi Ada',
    });
  });

  it('shows the action state instead of success when given one', async () => {
    sileo.promise(Promise.resolve(1), {
      loading: { title: 'Uploading' },
      success: { title: 'Done' },
      error: { title: 'Failed' },
      action: (n) => ({ title: `Share ${n}` }),
    });
    await flush();
    expect(store.toasts[0]).toMatchObject({
      state: 'action',
      title: 'Share 1',
    });
  });

  it('shows the error state on rejection', async () => {
    const p = Promise.reject(new Error('boom'));
    sileo.promise(p, {
      loading: { title: 'Saving' },
      success: { title: 'Done' },
      error: (err) => ({ title: (err as Error).message }),
    });
    await p.catch(() => {});
    await flush();
    expect(store.toasts[0]).toMatchObject({ state: 'error', title: 'boom' });
  });

  it('accepts a function returning the promise and a position', async () => {
    sileo.promise(() => Promise.resolve(), {
      loading: { title: 'Loading' },
      success: { title: 'Done' },
      error: { title: 'Failed' },
      position: 'bottom-right',
    });
    expect(store.toasts[0]!.position).toBe('bottom-right');
    await flush();
    expect(store.toasts[0]).toMatchObject({
      state: 'success',
      position: 'bottom-right',
    });
  });
});

describe('subscription', () => {
  it('notifies subscribers and stops after unsubscribing', () => {
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);
    sileo.success({ title: 'Hi' });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).toBe(store.toasts);
    unsubscribe();
    sileo.success({ title: 'Again' });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
