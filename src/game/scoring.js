/**
 * Pontuação por rodada.
 *
 * UX: SEMPRE recebemos pelo menos 1 estrela — não existe "zerar" nem
 * punição. As estrelas comunicam eficiência, nunca fracasso.
 */

/**
 * Estrelas de uma rodada concluída.
 * @param {number} moves - jogadas usadas (cada tentativa de par conta 1)
 * @param {number} pairs - total de pares do nível
 * @returns {1|2|3}
 */
export function starsFor(moves, pairs) {
  if (!Number.isFinite(moves) || !Number.isFinite(pairs) || pairs <= 0) return 1;
  if (moves <= pairs + 1) return 3; // quase perfeito
  if (moves <= Math.ceil(pairs * 2.5)) return 2; // bom ritmo
  return 1; // concluiu — e concluir já é ótimo
}

/** Mantém o melhor recorde entre dois valores de estrela. */
export function bestStars(a, b) {
  return Math.max(a || 0, b || 0);
}
