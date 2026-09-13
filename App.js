import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator, { navigationTheme } from './src/navigation/RootNavigator';
import { AppStateProvider } from './src/state/AppStateContext';

/**
 * Cognia — jogo de pareamento para estimulação cognitiva de crianças
 * (autistas e além). Pilha de dependências enxuta por decisão de projeto:
 * cada biblioteca a menos é menos superfície de falha no aparelho da família.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
        <StatusBar style="dark" />
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
