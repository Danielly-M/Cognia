import React from 'react';
import { render, screen } from '@testing-library/react-native';
import StarRow from '../StarRow';

describe('<StarRow />', () => {
  test.each([0, 1, 2, 3])('anuncia %i de 3 estrelas', async (count) => {
    await render(<StarRow count={count} testID="stars" />);
    expect(screen.getByTestId('stars').props.accessibilityLabel).toBe(`${count} de 3 estrelas`);
  });

  test('valores fora de faixa são limitados com segurança', async () => {
    await render(<StarRow count={99} testID="stars" />);
    expect(screen.getByTestId('stars').props.accessibilityLabel).toBe('3 de 3 estrelas');
  });

  test('valores negativos viram zero', async () => {
    await render(<StarRow count={-4} testID="stars" />);
    expect(screen.getByTestId('stars').props.accessibilityLabel).toBe('0 de 3 estrelas');
  });

  test('sempre mostra as 3 posições de estrela (previsível)', async () => {
    await render(<StarRow count={1} />);
    expect(screen.getAllByText(/★|☆/)).toHaveLength(3);
  });
});
