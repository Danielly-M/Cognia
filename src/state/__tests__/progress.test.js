import {
  applyCompletion,
  bestStarsFor,
  categoryStars,
  createEmptyProgress,
  isLevelUnlockedFor,
  PROGRESS_VERSION,
  resetProgress,
  totalStars,
} from '../progress';
import { LEVELS } from '../../game/levels';

const CAT = 'cores';
const L = LEVELS; // [nivel-1, nivel-2, nivel-3]

describe('applyCompletion', () => {
  test('registra a primeira vitória', () => {
    const p = applyCompletion(createEmptyProgress(), CAT, L[0].id, 2, '2026-01-01T00:00:00.000Z');
    expect(bestStarsFor(p, CAT, L[0].id)).toBe(2);
    expect(p.records[CAT][L[0].id].plays).toBe(1);
    expect(p.records[CAT][L[0].id].lastPlayedAt).toBe('2026-01-01T00:00:00.000Z');
    expect(p.totalPlays).toBe(1);
  });

  test('guarda o MELHOR resultado, mas soma as jogadas', () => {
    let p = applyCompletion(createEmptyProgress(), CAT, L[0].id, 3, 't1');
    p = applyCompletion(p, CAT, L[0].id, 1, 't2');
    expect(bestStarsFor(p, CAT, L[0].id)).toBe(3);
    expect(p.records[CAT][L[0].id].plays).toBe(2);
    expect(p.totalPlays).toBe(2);
  });

  test('estrelas são limitadas ao intervalo 1..3 (dados externos não quebram o app)', () => {
    let p = applyCompletion(createEmptyProgress(), CAT, L[0].id, 99, 't');
    expect(bestStarsFor(p, CAT, L[0].id)).toBe(3);
    p = applyCompletion(createEmptyProgress(), CAT, L[1].id, 0, 't');
    expect(bestStarsFor(p, CAT, L[1].id)).toBe(1);
    p = applyCompletion(createEmptyProgress(), CAT, L[1].id, null, 't');
    expect(bestStarsFor(p, CAT, L[1].id)).toBe(1);
  });

  test('não muta o progresso anterior (função pura)', () => {
    const before = createEmptyProgress();
    applyCompletion(before, CAT, L[0].id, 3, 't');
    expect(before.records).toEqual({});
    expect(before.totalPlays).toBe(0);
  });
});

describe('desbloqueio de níveis', () => {
  test('nível 1 está sempre aberto', () => {
    expect(isLevelUnlockedFor(createEmptyProgress(), CAT, L, 0)).toBe(true);
  });

  test('nível seguinte exige ao menos 1 estrela no anterior', () => {
    let p = createEmptyProgress();
    expect(isLevelUnlockedFor(p, CAT, L, 1)).toBe(false);
    p = applyCompletion(p, CAT, L[0].id, 1, 't');
    expect(isLevelUnlockedFor(p, CAT, L, 1)).toBe(true);
    expect(isLevelUnlockedFor(p, CAT, L, 2)).toBe(false);
  });

  test('desbloqueio é independente por categoria', () => {
    let p = applyCompletion(createEmptyProgress(), CAT, L[0].id, 3, 't');
    expect(isLevelUnlockedFor(p, 'formas', L, 1)).toBe(false);
    p = applyCompletion(p, 'formas', L[0].id, 1, 't');
    expect(isLevelUnlockedFor(p, 'formas', L, 1)).toBe(true);
  });
});

describe('contagem de estrelas', () => {
  test('totalStars soma tudo; categoryStars soma por categoria', () => {
    let p = applyCompletion(createEmptyProgress(), CAT, L[0].id, 3, 't');
    p = applyCompletion(p, CAT, L[1].id, 2, 't');
    p = applyCompletion(p, 'animais', L[0].id, 1, 't');
    expect(categoryStars(p, CAT)).toBe(5);
    expect(categoryStars(p, 'animais')).toBe(1);
    expect(categoryStars(p, 'formas')).toBe(0);
    expect(totalStars(p)).toBe(6);
  });

  test('progresso vazio não quebra as somas', () => {
    expect(totalStars(createEmptyProgress())).toBe(0);
    expect(totalStars(undefined)).toBe(0);
    expect(categoryStars(null, CAT)).toBe(0);
    expect(bestStarsFor({}, CAT, 'x')).toBe(0);
  });
});

describe('reset', () => {
  test('resetProgress volta ao estado vazio versionado', () => {
    let p = applyCompletion(createEmptyProgress(), CAT, L[0].id, 3, 't');
    p = resetProgress();
    expect(p).toEqual(createEmptyProgress());
    expect(p.version).toBe(PROGRESS_VERSION);
  });
});
