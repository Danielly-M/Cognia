/**
 * Testes de persistência com um AsyncStorage de memória: validam o
 * comportamento resiliente (JSON corrompido, versão errada, storage fora do ar).
 */
jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key) => (key in store ? store[key] : null)),
      setItem: jest.fn(async (key, value) => {
        store[key] = String(value);
      }),
      __reset: () => {
        store = {};
      },
    },
  };
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadProgress,
  loadSettings,
  saveProgress,
  saveSettings,
  STORAGE_KEYS,
} from '../storage';
import { createEmptyProgress, PROGRESS_VERSION } from '../progress';
import { DEFAULT_SETTINGS } from '../settings';

const memory = AsyncStorage;

beforeEach(() => {
  memory.__reset();
  memory.getItem.mockClear();
  memory.setItem.mockClear();
});

describe('progresso persistido', () => {
  test('sem dados salvos → progresso vazio padrão', async () => {
    const p = await loadProgress();
    expect(p).toEqual(createEmptyProgress());
    expect(p.version).toBe(PROGRESS_VERSION);
  });

  test('round-trip de salvar e carregar', async () => {
    const p = { version: PROGRESS_VERSION, records: { cores: { 'nivel-1': { stars: 3, plays: 2 } } }, totalPlays: 2 };
    expect(await saveProgress(p)).toBe(true);
    const loaded = await loadProgress();
    expect(loaded.records.cores['nivel-1'].stars).toBe(3);
    expect(loaded.totalPlays).toBe(2);
  });

  test('JSON corrompido NÃO derruba o app — cai no padrão', async () => {
    await memory.setItem(STORAGE_KEYS.progress, '{isso não é json');
    const p = await loadProgress();
    expect(p).toEqual(createEmptyProgress());
  });

  test('versão incompatível é descartada com segurança', async () => {
    await memory.setItem(
      STORAGE_KEYS.progress,
      JSON.stringify({ version: 999, records: {}, totalPlays: 42 }),
    );
    const p = await loadProgress();
    expect(p).toEqual(createEmptyProgress());
  });

  test('falha do storage devolve padrão e save sinaliza false (sem exceção)', async () => {
    memory.getItem.mockRejectedValueOnce(new Error('storage morreu'));
    expect(await loadProgress()).toEqual(createEmptyProgress());

    memory.setItem.mockRejectedValueOnce(new Error('storage morreu'));
    expect(await saveProgress(createEmptyProgress())).toBe(false);
  });
});

describe('configurações persistidas', () => {
  test('sem dados → padrões', async () => {
    expect(await loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  test('round-trip preservando escolhas', async () => {
    await saveSettings({ ...DEFAULT_SETTINGS, sound: false, reduceMotion: true });
    const s = await loadSettings();
    expect(s.sound).toBe(false);
    expect(s.reduceMotion).toBe(true);
  });

  test('configuração corrompida vira padrão', async () => {
    await memory.setItem(STORAGE_KEYS.settings, 'null}');
    expect(await loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
});
