import { DEFAULT_SETTINGS, sanitizeSettings, SETTINGS_VERSION, updateSetting } from '../settings';

describe('sanitizeSettings — dados externos nunca quebram o app', () => {
  test('valores ausentes ou inválidos viram os padrões', () => {
    expect(sanitizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings('lixo')).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings(42)).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings({})).toEqual(DEFAULT_SETTINGS);
  });

  test('versão incompatível descarta tudo e usa os padrões', () => {
    const future = { version: SETTINGS_VERSION + 1, sound: false, reduceMotion: true };
    expect(sanitizeSettings(future)).toEqual(DEFAULT_SETTINGS);
  });

  test('campos com tipo errado caem no padrão, campos válidos sobrevivem', () => {
    const raw = {
      version: SETTINGS_VERSION,
      sound: 'sim',
      reduceMotion: true,
      showLabels: false,
    };
    const out = sanitizeSettings(raw);
    expect(out.sound).toBe(DEFAULT_SETTINGS.sound);
    expect(out.reduceMotion).toBe(true);
    expect(out.showLabels).toBe(false);
  });

  test('chaves desconhecidas são descartadas (superfície fechada)', () => {
    const out = sanitizeSettings({ ...DEFAULT_SETTINGS, admin: true, __proto: 'x' });
    expect(Object.keys(out).sort()).toEqual(['reduceMotion', 'showLabels', 'sound', 'version']);
  });
});

describe('updateSetting', () => {
  test('atualiza de forma imutável e validada', () => {
    const before = { ...DEFAULT_SETTINGS };
    const after = updateSetting(before, 'sound', false);
    expect(before.sound).toBe(true);
    expect(after.sound).toBe(false);
    expect(after.version).toBe(SETTINGS_VERSION);
  });

  test('tentativa de valor inválido volta ao padrão da chave', () => {
    const after = updateSetting(DEFAULT_SETTINGS, 'sound', 'ligado-achismo');
    expect(after.sound).toBe(DEFAULT_SETTINGS.sound);
  });
});
