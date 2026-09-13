import { createGameState, gameReducer, remainingCards, selectedIsMatch } from '../engine';
import { buildDeck } from '../deck';
import { CATEGORIES, LEVELS } from '../levels';
import { mulberry32 } from '../../utils/rng';

const cores = CATEGORIES.find((c) => c.id === 'cores');

function freshGame(level = LEVELS[0], seed = 42) {
  return createGameState(buildDeck(cores, level, mulberry32(seed)));
}

/** Índices das duas cartas do mesmo par. */
function pairIndexes(state) {
  const seen = {};
  state.cards.forEach((card, i) => {
    (seen[card.pairId] = seen[card.pairId] || []).push(i);
  });
  return Object.values(seen);
}

/** Índices de duas cartas de pares diferentes. */
function mismatchIndexes(state) {
  return [0, state.cards.findIndex((c, i) => i !== 0 && c.pairId !== state.cards[0].pairId)];
}

describe('gameReducer — virar cartas', () => {
  test('primeira carta vira e o jogo segue aguardando', () => {
    const s0 = freshGame();
    const s1 = gameReducer(s0, { type: 'flip', index: 0 });
    expect(s1.cards[0].faceUp).toBe(true);
    expect(s1.selected).toEqual([0]);
    expect(s1.moves).toBe(0);
    expect(s1.status).toBe('idle');
  });

  test('segunda carta fecha a jogada: status resolving e +1 movimento', () => {
    const s0 = freshGame();
    const s1 = gameReducer(s0, { type: 'flip', index: 0 });
    const s2 = gameReducer(s1, { type: 'flip', index: 1 });
    expect(s2.status).toBe('resolving');
    expect(s2.moves).toBe(1);
    expect(s2.selected).toHaveLength(2);
  });

  test('ignora flip da mesma carta já virada', () => {
    const s1 = gameReducer(freshGame(), { type: 'flip', index: 0 });
    const s2 = gameReducer(s1, { type: 'flip', index: 0 });
    expect(s2).toBe(s1);
  });

  test('ignora qualquer flip enquanto há duas cartas em avaliação', () => {
    const s0 = freshGame(LEVELS[2]);
    const s1 = gameReducer(gameReducer(s0, { type: 'flip', index: 0 }), { type: 'flip', index: 1 });
    const s2 = gameReducer(s1, { type: 'flip', index: 2 });
    expect(s2).toBe(s1);
  });

  test('ignora flip em índice inexistente', () => {
    const s0 = freshGame();
    expect(gameReducer(s0, { type: 'flip', index: 99 })).toBe(s0);
  });

  test('ação desconhecida não muda o estado', () => {
    const s0 = freshGame();
    expect(gameReducer(s0, { type: 'danca' })).toBe(s0);
  });
});

describe('gameReducer — avaliação do par', () => {
  test('par correto fica matched e soma matchedCount', () => {
    const s0 = freshGame();
    const [a, b] = pairIndexes(s0)[0];
    let s = gameReducer(s0, { type: 'flip', index: a });
    s = gameReducer(s, { type: 'flip', index: b });
    expect(selectedIsMatch(s)).toBe(true);
    s = gameReducer(s, { type: 'resolve' });
    expect(s.cards[a].matched).toBe(true);
    expect(s.cards[b].matched).toBe(true);
    expect(s.matchedCount).toBe(1);
    expect(s.status).toBe('idle');
  });

  test('par errado devolve as cartas (faceUp false, matched false)', () => {
    const s0 = freshGame();
    const [a, b] = mismatchIndexes(s0);
    let s = gameReducer(s0, { type: 'flip', index: a });
    s = gameReducer(s, { type: 'flip', index: b });
    expect(selectedIsMatch(s)).toBe(false);
    s = gameReducer(s, { type: 'resolve' });
    expect(s.cards[a].faceUp).toBe(false);
    expect(s.cards[b].faceUp).toBe(false);
    expect(s.cards[a].matched).toBe(false);
    expect(s.status).toBe('idle');
  });

  test('resolve fora de hora é ignorado', () => {
    const s0 = freshGame();
    expect(gameReducer(s0, { type: 'resolve' })).toBe(s0);
  });

  test('carta já encontrada não pode ser virada de novo', () => {
    const s0 = freshGame();
    const [a, b] = pairIndexes(s0)[0];
    let s = gameReducer(s0, { type: 'flip', index: a });
    s = gameReducer(s, { type: 'flip', index: b });
    s = gameReducer(s, { type: 'resolve' });
    const after = gameReducer(s, { type: 'flip', index: a });
    expect(after).toBe(s);
  });
});

describe('gameReducer — partida completa', () => {
  test('sequência perfeita termina com status won e o mínimo de jogadas', () => {
    let s = freshGame(LEVELS[2], 7);
    const pairs = pairIndexes(s);
    pairs.forEach(([a, b]) => {
      s = gameReducer(s, { type: 'flip', index: a });
      s = gameReducer(s, { type: 'flip', index: b });
      s = gameReducer(s, { type: 'resolve' });
    });
    expect(s.status).toBe('won');
    expect(s.moves).toBe(LEVELS[2].pairs);
    expect(remainingCards(s)).toBe(0);
  });

  test('não é possível jogar depois de vencer', () => {
    let s = freshGame(LEVELS[0], 5);
    pairIndexes(s).forEach(([a, b]) => {
      s = gameReducer(s, { type: 'flip', index: a });
      s = gameReducer(s, { type: 'flip', index: b });
      s = gameReducer(s, { type: 'resolve' });
    });
    expect(s.status).toBe('won');
    const idx = s.cards.findIndex((c) => c.matched);
    expect(gameReducer(s, { type: 'flip', index: idx })).toBe(s);
  });

  test('restart recomeça com baralho novo e estado limpo', () => {
    let s = freshGame();
    const [a, b] = mismatchIndexes(s);
    s = gameReducer(s, { type: 'flip', index: a });
    s = gameReducer(s, { type: 'flip', index: b });
    const novoDeck = buildDeck(cores, LEVELS[1], mulberry32(123));
    s = gameReducer(s, { type: 'restart', deck: novoDeck });
    expect(s.status).toBe('idle');
    expect(s.moves).toBe(0);
    expect(s.cards).toHaveLength(LEVELS[1].pairs * 2);
    s.cards.forEach((c) => {
      expect(c.faceUp).toBe(false);
      expect(c.matched).toBe(false);
    });
  });
});
