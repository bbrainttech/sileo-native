import { describe, expect, it } from '@jest/globals';
import { createTheme, defaultTheme, resolveTheme, themes } from '../theme';

describe('resolveTheme', () => {
  it('is the white web default with no theme', () => {
    expect(resolveTheme(undefined, 'dark')).toBe(defaultTheme);
    expect(defaultTheme.fill).toBe('#FFFFFF');
  });

  it('picks the named themes, and the scheme for system', () => {
    expect(resolveTheme('light', 'dark')).toBe(themes.light);
    expect(resolveTheme('dark', 'light')).toBe(themes.dark);
    expect(resolveTheme('system', 'dark')).toBe(themes.dark);
    expect(resolveTheme('system', 'light')).toBe(themes.light);
  });

  it('keeps the web fills: a dark toast for a light app and back', () => {
    expect(themes.light.fill).toBe('#1a1a1a');
    expect(themes.dark.fill).toBe('#f2f2f2');
  });

  it('lays an overrides object over the default theme', () => {
    const theme = resolveTheme(
      { fill: '#000', stateColors: { success: '#0f0' } },
      'light'
    );
    expect(theme.fill).toBe('#000');
    expect(theme.stateColors.success).toBe('#0f0');
    expect(theme.stateColors.error).toBe(defaultTheme.stateColors.error);
    expect(theme.description).toBe(defaultTheme.description);
  });

  it('picks per-scheme overrides and lays them over that scheme', () => {
    const prop = { light: { fill: '#111' }, dark: { fill: '#eee' } };
    expect(resolveTheme(prop, 'light')).toMatchObject({
      fill: '#111',
      description: themes.light.description,
    });
    expect(resolveTheme(prop, 'dark')).toMatchObject({
      fill: '#eee',
      description: themes.dark.description,
    });
  });
});

describe('createTheme', () => {
  it('merges nested groups instead of replacing them', () => {
    const theme = createTheme(
      { glass: { tint: '#f00' }, tones: { badge: 0.3 } },
      themes.dark
    );
    expect(theme.glass).toEqual({ ...themes.dark.glass, tint: '#f00' });
    expect(theme.tones).toEqual({ ...themes.dark.tones, badge: 0.3 });
  });

  it('does not touch the theme it builds on', () => {
    const before = JSON.stringify(defaultTheme);
    createTheme({ fill: '#123', stateColors: { info: '#456' } });
    expect(JSON.stringify(defaultTheme)).toBe(before);
  });
});
