import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import GameCard from '../GameCard';

const baseCard = {
  key: 'animais-gato-a',
  pairId: 'gato',
  kind: 'emoji',
  label: 'Gato',
  emoji: '🐱',
  faceUp: false,
  matched: false,
};

async function setup(overrides = {}, props = {}) {
  const onPress = jest.fn();
  const utils = await render(
    <GameCard
      card={{ ...baseCard, ...overrides }}
      index={3}
      onPress={onPress}
      size={120}
      {...props}
    />,
  );
  return { onPress, ...utils };
}

describe('<GameCard /> — o estado da carta é SEMPRE anunciado por texto', () => {
  test('carta fechada', async () => {
    await setup();
    expect(screen.getByRole('button', { name: 'Carta fechada' })).toBeOnTheScreen();
  });

  test('carta virada anuncia o conteúdo', async () => {
    await setup({ faceUp: true });
    expect(screen.getByRole('button', { name: 'Carta virada: Gato' })).toBeOnTheScreen();
  });

  test('par encontrado anuncia a conquista', async () => {
    await setup({ matched: true, faceUp: true });
    expect(screen.getByRole('button', { name: 'Par encontrado: Gato' })).toBeOnTheScreen();
  });

  test('mostra o rótulo escrito quando showLabels está ligado (padrão)', async () => {
    await setup({ faceUp: true });
    expect(screen.getByText('Gato')).toBeOnTheScreen();
  });

  test('esconde o rótulo quando showLabels está desligado', async () => {
    await setup({ faceUp: true }, { showLabels: false });
    expect(screen.queryByText('Gato')).toBeNull();
  });

  test('carta fechada não revela o conteúdo no texto acessível (sem spoiler)', async () => {
    await setup();
    expect(screen.queryByText('Gato')).toBeNull();
  });
});

describe('<GameCard /> — interação', () => {
  test('toque aciona onPress com o índice da carta', async () => {
    const { onPress } = await setup();
    await fireEvent.press(screen.getByRole('button', { name: 'Carta fechada' }));
    expect(onPress).toHaveBeenCalledWith(3);
  });

  test('par já encontrado não é jogável', async () => {
    const { onPress } = await setup({ matched: true, faceUp: true });
    await fireEvent.press(screen.getByRole('button', { name: 'Par encontrado: Gato' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  test('tabuleiro em avaliação (interactive=false) bloqueia toques', async () => {
    const { onPress } = await setup({}, { interactive: false });
    await fireEvent.press(screen.getByRole('button', { name: 'Carta fechada' }));
    expect(onPress).not.toHaveBeenCalled();
  });
});
