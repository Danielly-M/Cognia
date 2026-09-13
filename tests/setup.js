/**
 * Setup global do Jest.
 * Mock oficial do AsyncStorage (da própria lib) para todo o suíte —
 * testes que quiserem comportamento específico podem sobrescrever com jest.mock.
 */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// expo-audio usa turbo módulos nativos indisponíveis no Jest.
// (O comportamento sonoro é testado via injeção na fábrica createSounds.)
jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => null),
}));
