/**
 * Sons do jogo — curtos, suaves e nunca agressivos.
 *
 * Princípio de UX: erro NÃO tem som "negativo" (buzzer). O som de "tente
 * de novo" é um toque grave e macio; acerto é um arpejo ascendente claro.
 *
 * `createSounds` é uma fábrica injetável → testável sem native modules.
 * O singleton `gameSounds` usa `expo-audio` em produção.
 */
import { createAudioPlayer } from 'expo-audio';

const SOURCES = {
  acerto: require('../../assets/sounds/acerto.wav'),
  erro: require('../../assets/sounds/erro.wav'),
  vitoria: require('../../assets/sounds/vitoria.wav'),
};

/** Volume mestre baixo: reforço positivo sem agressão sensorial. */
export const MASTER_VOLUME = 0.45;

/**
 * Fábrica testável de tocadores de efeito.
 * @param {object} opts
 * @param {(source: any) => { seekTo:(s:number)=>void, play:()=>void }} opts.playerFactory
 * @param {() => boolean} [opts.isEnabled]
 */
export function createSounds({ playerFactory, isEnabled = () => true, volume = MASTER_VOLUME }) {
  const players = new Map();

  function playerFor(name) {
    if (!SOURCES[name]) return null;
    if (!players.has(name)) {
      const player = playerFactory(SOURCES[name]);
      if (player && typeof player.play === 'function') {
        if ('volume' in player) player.volume = volume;
        players.set(name, player);
      } else {
        return null;
      }
    }
    return players.get(name);
  }

  /**
   * Toca um efeito ('acerto' | 'erro' | 'vitoria').
   * Nunca lança exceção: áudio é enriquecimento, jamais pode derrubar o jogo.
   */
  function play(name) {
    if (!isEnabled()) return false;
    try {
      const player = playerFor(name);
      if (!player) return false;
      try {
        player.seekTo(0);
      } catch {
        // alguns players recusam seek antes do carregamento — segue o jogo
      }
      player.play();
      return true;
    } catch {
      return false;
    }
  }

  function releaseAll() {
    players.forEach((player) => {
      try {
        if (typeof player.remove === 'function') player.remove();
      } catch {
        // ignore
      }
    });
    players.clear();
  }

  return { play, releaseAll };
}

/** Instância padrão do aplicativo. */
export const gameSounds = createSounds({
  playerFactory: (source) => createAudioPlayer(source),
});
