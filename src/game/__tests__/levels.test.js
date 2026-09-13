import { CATEGORIES, getCategory, getNextLevel, getLevel, LEVELS } from '../levels';

describe('estrutura de categorias e níveis (invariantes de conteúdo)', () => {
  test('há exatamente 3 níveis, em ordem crescente de pares', () => {
    expect(LEVELS).toHaveLength(3);
    const pairs = LEVELS.map((l) => l.pairs);
    expect(pairs).toEqual([...pairs].sort((a, b) => a - b));
    for (let i = 1; i < pairs.length; i += 1) {
      expect(pairs[i]).toBeGreaterThan(pairs[i - 1]);
    }
  });

  test('ids de níveis e categorias são únicos', () => {
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(LEVELS.length);
    expect(new Set(CATEGORIES.map((c) => c.id)).size).toBe(CATEGORIES.length);
  });

  test('todas as categorias têm pares suficientes para o nível mais difícil', () => {
    const maxPairs = Math.max(...LEVELS.map((l) => l.pairs));
    CATEGORIES.forEach((cat) => {
      expect(cat.pairs.length).toBeGreaterThanOrEqual(maxPairs);
    });
  });

  test('o total de cartas cabe na grade do nível (linhas inteiras)', () => {
    LEVELS.forEach((level) => {
      expect((level.pairs * 2) % level.cols).toBe(0);
    });
  });

  test('cada par tem id único, rótulo e o conteúdo do tipo da categoria', () => {
    CATEGORIES.forEach((cat) => {
      expect(new Set(cat.pairs.map((p) => p.id)).size).toBe(cat.pairs.length);
      cat.pairs.forEach((pair) => {
        expect(typeof pair.label).toBe('string');
        expect(pair.label.trim().length).toBeGreaterThan(0);
        if (cat.kind === 'color') expect(typeof pair.color).toBe('string');
        if (cat.kind === 'shape') expect(typeof pair.shape).toBe('string');
        if (cat.kind === 'emoji') expect(typeof pair.emoji).toBe('string');
      });
    });
  });

  test('cores são hexadecimais válidas (paleta controlada)', () => {
    const hex = CATEGORIES.find((c) => c.id === 'cores');
    hex.pairs.forEach((p) => {
      expect(p.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

describe('buscadores', () => {
  test('getCategory / getLevel encontram e ignoram ids inválidos', () => {
    expect(getCategory('cores')).not.toBeNull();
    expect(getCategory('nao-existe')).toBeNull();
    expect(getLevel(LEVELS[0].id)).not.toBeNull();
    expect(getLevel('x')).toBeNull();
  });

  test('getNextLevel encadeia e termina em null', () => {
    expect(getNextLevel(LEVELS[0].id)).toBe(LEVELS[1]);
    expect(getNextLevel(LEVELS[1].id)).toBe(LEVELS[2]);
    expect(getNextLevel(LEVELS[2].id)).toBeNull();
    expect(getNextLevel('inexistente')).toBeNull();
  });
});
