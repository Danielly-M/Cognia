import { buildDeck } from '../deck';
import { CATEGORIES, LEVELS } from '../levels';
import { mulberry32 } from '../../utils/rng';

const cores = CATEGORIES.find((c) => c.id === 'cores');
const nivel1 = LEVELS[0];

describe('buildDeck', () => {
  test('gera exatamente 2 cartas por par e o total do nível', () => {
    const deck = buildDeck(cores, nivel1, mulberry32(1));
    expect(deck).toHaveLength(nivel1.pairs * 2);
    const byPair = {};
    deck.forEach((card) => {
      byPair[card.pairId] = (byPair[card.pairId] || 0) + 1;
    });
    Object.values(byPair).forEach((count) => expect(count).toBe(2));
    expect(Object.keys(byPair)).toHaveLength(nivel1.pairs);
  });

  test('keys são únicas', () => {
    const deck = buildDeck(cores, LEVELS[2], mulberry32(7));
    const keys = deck.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test('mesma semente → mesmo baralho (determinismo para testes)', () => {
    const a = buildDeck(cores, LEVELS[2], mulberry32(42));
    const b = buildDeck(cores, LEVELS[2], mulberry32(42));
    expect(a.map((c) => c.key)).toEqual(b.map((c) => c.key));
  });

  test('sementes diferentes → embaralhamento diferente (com alta probabilidade)', () => {
    const a = buildDeck(cores, LEVELS[2], mulberry32(1));
    const b = buildDeck(cores, LEVELS[2], mulberry32(999));
    expect(a.map((c) => c.key)).not.toEqual(b.map((c) => c.key));
  });

  test('cartas carregam o conteúdo visual e o rótulo do par', () => {
    const animais = CATEGORIES.find((c) => c.id === 'animais');
    const deck = buildDeck(animais, nivel1, mulberry32(3));
    deck.forEach((card) => {
      expect(card.kind).toBe('emoji');
      expect(typeof card.label).toBe('string');
      expect(card.label.length).toBeGreaterThan(0);
      expect(card.faceUp).toBe(false);
      expect(card.matched).toBe(false);
    });
  });

  test('falha claramente se o nível pedir pares demais', () => {
    const categoriaPobre = { id: 'x', kind: 'color', pairs: [{ id: 'a', label: 'A', color: '#fff' }] };
    expect(() => buildDeck(categoriaPobre, LEVELS[2])).toThrow();
  });

  test('falha se faltar categoria ou nível', () => {
    expect(() => buildDeck(null, nivel1)).toThrow();
    expect(() => buildDeck(cores, null)).toThrow();
  });
});
