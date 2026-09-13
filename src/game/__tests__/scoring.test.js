import { bestStars, starsFor } from '../scoring';

describe('starsFor', () => {
  test('execução quase perfeita rende 3 estrelas', () => {
    // 2 pares: mínimo teórico é 2 jogadas; aceita até 3.
    expect(starsFor(2, 2)).toBe(3);
    expect(starsFor(3, 2)).toBe(3);
    // 4 pares: até 5.
    expect(starsFor(4, 4)).toBe(3);
    expect(starsFor(5, 4)).toBe(3);
  });

  test('ritmo bom rende 2 estrelas', () => {
    expect(starsFor(4, 2)).toBe(2); // limite ceil(2*2.5)=5
    expect(starsFor(5, 2)).toBe(2);
    expect(starsFor(10, 4)).toBe(2); // limite ceil(4*2.5)=10
  });

  test('terminar SEMPRE rende ao menos 1 estrela — nunca zero', () => {
    expect(starsFor(6, 2)).toBe(1);
    expect(starsFor(999, 4)).toBe(1);
    expect(starsFor(10 ** 9, 2)).toBe(1);
  });

  test('entradas inválidas não quebram (devolve 1)', () => {
    expect(starsFor(NaN, 2)).toBe(1);
    expect(starsFor(undefined, undefined)).toBe(1);
    expect(starsFor(3, 0)).toBe(1);
  });
});

describe('bestStars', () => {
  test('guarda o maior valor e tolera vazio', () => {
    expect(bestStars(2, 3)).toBe(3);
    expect(bestStars(3, 1)).toBe(3);
    expect(bestStars(undefined, 2)).toBe(2);
    expect(bestStars(null, null)).toBe(0);
  });
});
