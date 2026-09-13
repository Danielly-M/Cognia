/**
 * Montagem do baralho de cartas do jogo de pareamento.
 * Cada par aparece exatamente 2 vezes; posições embaralhadas.
 */
import { mulberry32, shuffle, timeSeed } from '../utils/rng';

/**
 * Cria as cartas de uma rodada.
 * @param {object} category - categoria (de levels.js)
 * @param {object} level - nível (de levels.js)
 * @param {() => number} [rng] - gerador opcional (determinístico em testes)
 * @returns {Array<object>} cartas
 */
export function buildDeck(category, level, rng = mulberry32(timeSeed())) {
  if (!category || !level) {
    throw new Error('buildDeck: categoria e nível são obrigatórios');
  }
  const available = category.pairs;
  if (level.pairs > available.length) {
    throw new Error(
      `buildDeck: nível pede ${level.pairs} pares, mas a categoria "${category.id}" tem ${available.length}`,
    );
  }
  const chosen = shuffle(available, rng).slice(0, level.pairs);

  const cards = [];
  chosen.forEach((pair) => {
    for (const side of ['a', 'b']) {
      cards.push({
        key: `${category.id}-${pair.id}-${side}`,
        pairId: pair.id,
        kind: category.kind,
        label: pair.label,
        color: pair.color,
        shape: pair.shape,
        emoji: pair.emoji,
        faceUp: false,
        matched: false,
      });
    }
  });

  return shuffle(cards, rng);
}
