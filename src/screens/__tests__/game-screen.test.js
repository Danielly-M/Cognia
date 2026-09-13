/**
 * Jogo completo na tela: viradas, avaliação após a pausa calma,
 * progresso e vitória com estrelas. Baralho fixo via mock para
 * determinismo total; pausa de avaliação encurtada via mock de tokens.
 */
jest.mock('../../game/deck', () => ({
  buildDeck: () => [
    { key: 'a1', pairId: 'maca', kind: 'emoji', label: 'Maçã', emoji: '🍎', faceUp: false, matched: false },
    { key: 'b1', pairId: 'banana', kind: 'emoji', label: 'Banana', emoji: '🍌', faceUp: false, matched: false },
    { key: 'a2', pairId: 'maca', kind: 'emoji', label: 'Maçã', emoji: '🍎', faceUp: false, matched: false },
    { key: 'b2', pairId: 'banana', kind: 'emoji', label: 'Banana', emoji: '🍌', faceUp: false, matched: false },
  ],
}));

jest.mock('../../theme/tokens', () => {
  const actual = jest.requireActual('../../theme/tokens');
  return { ...actual, motion: { ...actual.motion, revealDelay: 10 } };
});

import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppStateProvider } from '../../state/AppStateContext';
import { STORAGE_KEYS } from '../../state/storage';
import GameScreen from '../GameScreen';

/** Espera a pausa de avaliação (10ms) se passar de verdade. */
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 40));
  });
}

async function renderGame() {
  const navigation = { goBack: jest.fn(), popToTop: jest.fn(), replace: jest.fn() };
  const utils = await render(
    <AppStateProvider>
      <GameScreen
        navigation={navigation}
        route={{ params: { categoryId: 'cores', levelId: 'nivel-1' } }}
      />
    </AppStateProvider>,
  );
  return { navigation, ...utils };
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('<GameScreen />', () => {
  test('mostra 4 cartas fechadas e o progresso em texto', async () => {
    await renderGame();
    expect(screen.getAllByTestId(/card-\d/)).toHaveLength(4);
    expect(screen.getByText('0 de 2 pares encontrados')).toBeOnTheScreen();
  });

  test('dupla errada volta a ficar fechada após a pausa (nunca vermelho, nunca punição)', async () => {
    await renderGame();
    await fireEvent.press(screen.getByTestId('card-0'));
    await fireEvent.press(screen.getByTestId('card-1'));
    // Ainda viradas durante a pausa de avaliação.
    expect(screen.getByText('Maçã')).toBeOnTheScreen();
    await settle();
    // Voltaram a fechar e o progresso não mudou.
    expect(screen.getByTestId('card-0').props.accessibilityLabel).toBe('Carta fechada');
    expect(screen.getByTestId('card-1').props.accessibilityLabel).toBe('Carta fechada');
    expect(screen.getByText('0 de 2 pares encontrados')).toBeOnTheScreen();
  });

  test('dupla certa fica marcada e soma um par', async () => {
    await renderGame();
    await fireEvent.press(screen.getByTestId('card-0'));
    await fireEvent.press(screen.getByTestId('card-2'));
    await settle();
    expect(screen.getByTestId('card-0').props.accessibilityLabel).toBe('Par encontrado: Maçã');
    expect(screen.getByTestId('card-2').props.accessibilityLabel).toBe('Par encontrado: Maçã');
    expect(screen.getByText('1 de 2 pares encontrados')).toBeOnTheScreen();
  });

  test('vitória celebra, oferece próximo nível e persiste a conquista', async () => {
    await renderGame();
    await fireEvent.press(screen.getByTestId('card-0'));
    await fireEvent.press(screen.getByTestId('card-2'));
    await settle();
    await fireEvent.press(screen.getByTestId('card-1'));
    await fireEvent.press(screen.getByTestId('card-3'));
    await settle();

    expect(screen.getByText('Muito bem!')).toBeOnTheScreen();
    expect(screen.getByTestId('win-next')).toBeOnTheScreen(); // nível 2 foi aberto
    expect(screen.getByTestId('win-replay')).toBeOnTheScreen();
    expect(screen.getByTestId('win-home')).toBeOnTheScreen();

    await settle();
    const saved = JSON.parse(await AsyncStorage.getItem(STORAGE_KEYS.progress));
    // 2 jogadas para 2 pares = execução perfeita = 3 estrelas.
    expect(saved.records.cores['nivel-1'].stars).toBe(3);
  });

  test('jogar de novo embaralha um tabuleiro limpo', async () => {
    await renderGame();
    await fireEvent.press(screen.getByTestId('card-0'));
    await fireEvent.press(screen.getByTestId('card-2'));
    await settle();
    await fireEvent.press(screen.getByTestId('card-1'));
    await fireEvent.press(screen.getByTestId('card-3'));
    await settle();
    await fireEvent.press(screen.getByTestId('win-replay'));
    expect(screen.getByText('0 de 2 pares encontrados')).toBeOnTheScreen();
    expect(
      screen.getAllByTestId(/card-\d/).every((c) => c.props.accessibilityLabel === 'Carta fechada'),
    ).toBe(true);
  });
});
