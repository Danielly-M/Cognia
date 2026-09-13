/**
 * Persistência local (AsyncStorage) — resiliente por design.
 *
 * Regra de robustez: NUNCA deixamos um dado corrompido quebrar o app.
 * Qualquer erro (JSON inválido, versão incompatível, falha do storage)
 * devolve os padrões e segue em frente.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createEmptyProgress, PROGRESS_VERSION } from './progress';
import { DEFAULT_SETTINGS, sanitizeSettings, SETTINGS_VERSION } from './settings';

export const STORAGE_KEYS = {
  progress: 'cognia.progress.v1',
  settings: 'cognia.settings.v1',
};

function parseOr(raw, fallback) {
  if (raw == null) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

/** Carrega o progresso; devolve estrutura vazia se não houver/incompatível. */
export async function loadProgress() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.progress);
    const data = parseOr(raw, null);
    if (!data || data.version !== PROGRESS_VERSION || typeof data.records !== 'object') {
      return createEmptyProgress();
    }
    return { ...createEmptyProgress(), ...data };
  } catch {
    return createEmptyProgress();
  }
}

export async function saveProgress(progress) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

/** Carrega as configurações saneadas (defaults se ausentes/corrompidas). */
export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.settings);
    return sanitizeSettings(parseOr(raw, null));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify({ ...settings, version: SETTINGS_VERSION }));
    return true;
  } catch {
    return false;
  }
}
