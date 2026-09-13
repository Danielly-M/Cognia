/**
 * Configurações: cada escolha é imediata, explicada e persistente.
 * Inclui o fluxo perigoso (apagar estrelas) com confirmação obrigatória.
 */
import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppStateProvider } from '../../state/AppStateContext';
import { STORAGE_KEYS } from '../../state/storage';
import { DEFAULT_SETTINGS } from '../../state/settings';
import { PROGRESS_VERSION } from '../../state/progress';
import SettingsScreen from '../SettingsScreen';

async function renderScreen() {
  const navigation = { goBack: jest.fn() };
  const utils = await render(
    <AppStateProvider>
      <SettingsScreen navigation={navigation} />
    </AppStateProvider>,
  );
  // Deixa o carregamento assíncrono do AsyncStorage terminar antes de agir,
  // senão o load (lento) vence o reset (rápido) e reescreve o estado antigo.
  await act(async () => {
    await new Promise((r) => setTimeout(r, 30));
  });
  return { navigation, ...utils };
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  // SEMPRE restaurar o spy do Alert: sem isso, o próximo teste veria calls
  // acumulados de componentes já desmontados (callback órfão não persiste).
  jest.restoreAllMocks();
});

describe('<SettingsScreen />', () => {
  test('mostra as três opções com explicação em linguagem simples', async () => {
    await renderScreen();
    expect(screen.getByText('Sons do jogo')).toBeOnTheScreen();
    expect(screen.getByText('Animações reduzidas')).toBeOnTheScreen();
    expect(screen.getByText('Nome nas cartas')).toBeOnTheScreen();
    expect(screen.getByText('As cartas aparecem direto, sem movimento.')).toBeOnTheScreen();
  });

  test('alternar um som reflete imediatamente e persiste', async () => {
    await renderScreen();
    const switchSound = screen.getByTestId('setting-sound');
    expect(switchSound.props.value).toBe(DEFAULT_SETTINGS.sound);

    await fireEvent(screen.getByTestId('setting-sound-row'), 'onValueChange', false);

    expect(screen.getByTestId('setting-sound').props.value).toBe(false);
    // o botão de exemplo de som só existe com som ligado (nada toca escondido)
    expect(screen.queryByTestId('settings-sound-demo')).toBeNull();

    await new Promise((r) => setTimeout(r, 20));
    const saved = JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.settings));
    expect(saved.sound).toBe(false);
  });

  test('apagar estrelas exige confirmação E o cancelamento preserva tudo', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.progress,
      JSON.stringify({
        version: PROGRESS_VERSION,
        records: { cores: { 'nivel-1': { stars: 3, plays: 1, lastPlayedAt: 't' } } },
        totalPlays: 1,
      }),
    );
    await renderScreen();
    await fireEvent.press(screen.getByTestId('settings-reset'));

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    const [, , buttons] = Alert.alert.mock.calls[0];
    const cancel = buttons.find((b) => b.style === 'cancel');
    // Cancelar é deliberadamente um no-op (sem onPress) — nada deve mudar.
    expect(cancel.onPress).toBeUndefined();

    await new Promise((r) => setTimeout(r, 20));
    const untouched = JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.progress));
    expect(untouched.records.cores['nivel-1'].stars).toBe(3);
  });

  test('confirmar o apagamento zera o progresso persistido', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.progress,
      JSON.stringify({
        version: PROGRESS_VERSION,
        records: { cores: { 'nivel-1': { stars: 3, plays: 1, lastPlayedAt: 't' } } },
        totalPlays: 1,
      }),
    );
    await renderScreen();
    await fireEvent.press(screen.getByTestId('settings-reset'));

    const [, , buttons] = Alert.alert.mock.calls[0];
    const destructive = buttons.find((b) => b.style === 'destructive');
    await act(async () => {
      destructive.onPress();
      await new Promise((r) => setTimeout(r, 30));
    });
    const cleared = JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.progress));
    expect(cleared.records).toEqual({});
    expect(cleared.totalPlays).toBe(0);
  });
});
