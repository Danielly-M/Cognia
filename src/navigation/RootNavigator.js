import React from 'react';
import { DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CategoriesScreen from '../screens/CategoriesScreen';
import GameScreen from '../screens/GameScreen';
import HomeScreen from '../screens/HomeScreen';
import LevelsScreen from '../screens/LevelsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { colors } from '../theme/tokens';

/** Tema de navegação alinhado à paleta calma do app. */
export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.outline,
  },
};

/**
 * Pilha única e linear: sempre se volta para onde se veio.
 * Transição 'fade' (a mais discreta disponível) — nada desliza pela tela.
 */
const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Inicio"
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen name="Inicio" component={HomeScreen} />
      <Stack.Screen name="Categorias" component={CategoriesScreen} />
      <Stack.Screen name="Niveis" component={LevelsScreen} />
      <Stack.Screen name="Jogo" component={GameScreen} />
      <Stack.Screen name="Configuracoes" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
