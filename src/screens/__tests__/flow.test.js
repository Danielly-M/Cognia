/**
 * Fluxo de navegação e regras de UX na tela:
 * categorias → níveis (com desbloqueio gentil) e navegação da Home.
 */
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AppStateProvider } from '../../state/AppStateContext';
import { STORAGE_KEYS } from '../../state/storage';
import { PROGRESS_VERSION } from '../../state/progress';
import CategoriesScreen from '../CategoriesScreen';
import HomeScreen from '../HomeScreen';
import LevelsScreen from '../LevelsScreen';

// Observação: o jest-expo já fornece o mock do react-native-safe-area-context;
// envolver com o SafeAreaProvider real quebraria a renderização em testes.
async function renderWithProviders(ui) {
  const utils = await render(<AppStateProvider>{ui}</AppStateProvider>);
  // Garante que o carregamento assíncrono do storage termine antes das ações.
  await act(async () => {
    await new Promise((r) => setTimeout(r, 30));
  });
  return utils;
}

const nav = () => ({ navigate: jest.fn(), goBack: jest.fn(), popToTop: jest.fn() });

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('Home', () => {
  test('oferece Jogar e Configurações e navega para os destinos certos', async () => {
    const navigation = nav();
    await renderWithProviders(<HomeScreen navigation={navigation} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Jogar' }));
    expect(navigation.navigate).toHaveBeenCalledWith('Categorias');
    await fireEvent.press(screen.getByRole('button', { name: 'Configurações' }));
    expect(navigation.navigate).toHaveBeenCalledWith('Configuracoes');
  });
});

describe('Categorias', () => {
  test('mostra as três categorias com ajuda em texto', async () => {
    await renderWithProviders(<CategoriesScreen navigation={nav()} />);
    expect(screen.getByText('Cores')).toBeOnTheScreen();
    expect(screen.getByText('Formas')).toBeOnTheScreen();
    expect(screen.getByText('Animais')).toBeOnTheScreen();
    expect(screen.getByText('Encontre as cores iguais')).toBeOnTheScreen();
  });

  test('tocar em uma categoria abre os níveis daquela categoria', async () => {
    const navigation = nav();
    await renderWithProviders(<CategoriesScreen navigation={navigation} />);
    await fireEvent.press(screen.getByTestId('category-formas'));
    expect(navigation.navigate).toHaveBeenCalledWith('Niveis', { categoryId: 'formas' });
  });
});

describe('Níveis', () => {
  test('começo: nível 1 aberto, níveis seguintes bloqueados com explicação gentil', async () => {
    const navigation = nav();
    await renderWithProviders(
      <LevelsScreen navigation={navigation} route={{ params: { categoryId: 'cores' } }} />,
    );
    expect(screen.getAllByText('Termine o nível anterior para abrir este')).toHaveLength(2);

    // Bloqueado não navega.
    await fireEvent.press(screen.getByTestId('level-nivel-2'));
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  test('com estrela no nível 1, o nível 2 abre', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.progress,
      JSON.stringify({
        version: PROGRESS_VERSION,
        records: { cores: { 'nivel-1': { stars: 2, plays: 1, lastPlayedAt: 't' } } },
        totalPlays: 1,
      }),
    );
    const navigation = nav();
    await renderWithProviders(
      <LevelsScreen navigation={navigation} route={{ params: { categoryId: 'cores' } }} />,
    );
    await fireEvent.press(screen.getByTestId('level-nivel-2'));
    expect(navigation.navigate).toHaveBeenCalledWith('Jogo', {
      categoryId: 'cores',
      levelId: 'nivel-2',
    });
  });

  test('categoria inválida volta sozinha, sem tela de erro', async () => {
    const navigation = nav();
    await renderWithProviders(
      <LevelsScreen navigation={navigation} route={{ params: { categoryId: 'batata' } }} />,
    );
    expect(navigation.goBack).toHaveBeenCalled();
  });
});
