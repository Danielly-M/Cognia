/**
 * Providers globais: configurações e progresso, com carregamento inicial
 * do AsyncStorage e salvamento automático (sem spinner: mostramos os
 * padrões imediatamente — o app abre rápido e nunca trava).
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DEFAULT_SETTINGS, sanitizeSettings, updateSetting } from './settings';
import { createEmptyProgress, applyCompletion } from './progress';
import {
  loadProgress,
  loadSettings,
  saveProgress as persistProgress,
  saveSettings as persistSettings,
} from './storage';

const SettingsContext = createContext(null);
const ProgressContext = createContext(null);

export function AppStateProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [progress, setProgress] = useState(createEmptyProgress());
  const loadedRef = useRef(false);

  // Carrega o estado persistido uma única vez, ao abrir.
  useEffect(() => {
    let alive = true;
    (async () => {
      const [loadedSettings, loadedProgress] = await Promise.all([loadSettings(), loadProgress()]);
      if (!alive) return;
      setSettings(loadedSettings);
      setProgress(loadedProgress);
      loadedRef.current = true;
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Salva quando algo muda (após o carregamento inicial).
  useEffect(() => {
    if (loadedRef.current) persistSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (loadedRef.current) persistProgress(progress);
  }, [progress]);

  const setSetting = useCallback((key, value) => {
    setSettings((prev) => updateSetting(prev, key, value));
  }, []);

  const completeLevel = useCallback((categoryId, levelId, stars) => {
    setProgress((prev) => applyCompletion(prev, categoryId, levelId, stars, new Date().toISOString()));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(createEmptyProgress());
  }, []);

  const settingsValue = useMemo(
    () => ({ settings, setSetting, sanitizeSettings }),
    [settings, setSetting],
  );
  const progressValue = useMemo(
    () => ({ progress, completeLevel, resetProgress }),
    [progress, completeLevel, resetProgress],
  );

  return (
    <ProgressContext.Provider value={progressValue}>
      <SettingsContext.Provider value={settingsValue}>{children}</SettingsContext.Provider>
    </ProgressContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings deve ser usado dentro de <AppStateProvider>');
  return ctx;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress deve ser usado dentro de <AppStateProvider>');
  return ctx;
}
