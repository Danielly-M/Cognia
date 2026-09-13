import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import BigButton from '../BigButton';

describe('<BigButton />', () => {
  test('mostra o rótulo e é um botão acessível', async () => {
    await render(<BigButton label="Jogar" onPress={jest.fn()} />);
    const button = screen.getByRole('button', { name: 'Jogar' });
    expect(button).toBeOnTheScreen();
  });

  test('dispara onPress exatamente uma vez por toque', async () => {
    const onPress = jest.fn();
    await render(<BigButton label="Jogar" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Jogar' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('botão desabilitado não dispara e anuncia o estado', async () => {
    const onPress = jest.fn();
    await render(<BigButton label="Próximo" onPress={onPress} disabled />);
    const button = screen.getByRole('button', { name: 'Próximo' });
    expect(button.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  test('acessibilityLabel customizado substitui o texto visível (mesma informação)', async () => {
    await render(<BigButton label="★ 3" accessibilityLabel="Três estrelas" onPress={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Três estrelas' })).toBeOnTheScreen();
  });
});
