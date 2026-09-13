/**
 * Os módulos de UI importam expo-audio; no teste ele é um mock inofensivo.
 * O comportamento testado aqui é o da FÁBRICA injetável (createSounds).
 */
jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(),
}));

import { createSounds, MASTER_VOLUME } from '../sounds';

function makePlayer() {
  return { play: jest.fn(), seekTo: jest.fn(), volume: 1, remove: jest.fn() };
}

describe('createSounds', () => {
  test('toca o efeito com volume mestre e reinício da posição', () => {
    const player = makePlayer();
    const factory = jest.fn(() => player);
    const sounds = createSounds({ playerFactory: factory });

    expect(sounds.play('acerto')).toBe(true);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(player.volume).toBe(MASTER_VOLUME);
    expect(player.seekTo).toHaveBeenCalledWith(0);
    expect(player.play).toHaveBeenCalledTimes(1);
  });

  test('reutiliza o player entre toques (não recria a cada som)', () => {
    const player = makePlayer();
    const factory = jest.fn(() => player);
    const sounds = createSounds({ playerFactory: factory });
    sounds.play('acerto');
    sounds.play('acerto');
    expect(factory).toHaveBeenCalledTimes(1);
    expect(player.play).toHaveBeenCalledTimes(2);
  });

  test('com áudio desabilitado nada toca e nada é criado', () => {
    const factory = jest.fn(() => makePlayer());
    const sounds = createSounds({ playerFactory: factory, isEnabled: () => false });
    expect(sounds.play('acerto')).toBe(false);
    expect(factory).not.toHaveBeenCalled();
  });

  test('nome de som desconhecido é ignorado', () => {
    const sounds = createSounds({ playerFactory: () => makePlayer() });
    expect(sounds.play('explosao')).toBe(false);
  });

  test('player que explode NÃO derruba o jogo (som é enriquecimento)', () => {
    const grumpy = { play: jest.fn(), seekTo: jest.fn(() => { throw new Error('boom'); }) };
    const sounds = createSounds({ playerFactory: () => grumpy });
    expect(sounds.play('erro')).toBe(true); // seek falhou, mas play aconteceu
    expect(grumpy.play).toHaveBeenCalled();

    const broken = createSounds({ playerFactory: () => { throw new Error('sem áudio'); } });
    expect(broken.play('vitoria')).toBe(false);

    const noPlayer = createSounds({ playerFactory: () => null });
    expect(noPlayer.play('acerto')).toBe(false);
  });

  test('releaseAll libera os players e permite recriar depois', () => {
    const player = makePlayer();
    const factory = jest.fn(() => player);
    const sounds = createSounds({ playerFactory: factory });
    sounds.play('acerto');
    sounds.releaseAll();
    expect(player.remove).toHaveBeenCalledTimes(1);
    sounds.play('acerto');
    expect(factory).toHaveBeenCalledTimes(2);
  });
});
