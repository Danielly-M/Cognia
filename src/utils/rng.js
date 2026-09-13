/**
 * Utilidades de aleatoriedade determinística.
 * Um PRNG semeado (mulberry32) permite gerar baralhos reproduzíveis
 * em testes unitários, enquanto em produção usamos sementes do tempo.
 */

/**
 * Cria uma função geradora de números pseudoaleatórios [0,1).
 * @param {number} seed - semente inteira
 * @returns {() => number}
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Embaralha uma cópia do array (Fisher-Yates) usando o rng informado.
 * @param {Array} items
 * @param {() => number} rng
 * @returns {Array} novo array embaralhado
 */
export function shuffle(items, rng = Math.random) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/**
 * Semente baseada no relógio (usada em produção).
 * @returns {number}
 */
export function timeSeed() {
  return Date.now() % 0x7fffffff;
}
