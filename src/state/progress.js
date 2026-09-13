/**
 * Progresso do jogador — funções puras sobre um objeto de estado.
 *
 * Formato:
 * {
 *   version: 1,
 *   records: { [categoriaId]: { [nivelId]: { stars, plays, lastPlayedAt } } },
 *   totalPlays: number
 * }
 */
export const PROGRESS_VERSION = 1;

export function createEmptyProgress() {
  return { version: PROGRESS_VERSION, records: {}, totalPlays: 0 };
}

/** Estrelas conquistadas (melhor resultado) em um nível. */
export function bestStarsFor(progress, categoryId, levelId) {
  const rec = progress?.records?.[categoryId]?.[levelId];
  return rec ? rec.stars : 0;
}

/** Registra uma rodada concluída (mantém o melhor número de estrelas). */
export function applyCompletion(progress, categoryId, levelId, stars, playedAtIso) {
  const current = progress?.records?.[categoryId]?.[levelId];
  const next = {
    ...progress,
    records: {
      ...progress.records,
      [categoryId]: {
        ...progress.records[categoryId],
        [levelId]: {
          stars: Math.max(current ? current.stars : 0, Math.max(1, Math.min(3, stars || 1))),
          plays: (current ? current.plays : 0) + 1,
          lastPlayedAt: playedAtIso,
        },
      },
    },
    totalPlays: (progress.totalPlays || 0) + 1,
  };
  return next;
}

/**
 * Desbloqueio gentil e previsível: o primeiro nível de cada categoria está
 * sempre aberto; os seguintes abrem com pelo menos 1 estrela no anterior
 * (1 estrela = basta concluir, sem exigência de perfeição).
 */
export function isLevelUnlockedFor(progress, categoryId, levels, levelIndex) {
  if (levelIndex <= 0) return true;
  const prev = levels[levelIndex - 1];
  if (!prev) return true;
  return bestStarsFor(progress, categoryId, prev.id) > 0;
}

/** Soma todas as estrelas (exibida como conquista, não como meta). */
export function totalStars(progress) {
  let sum = 0;
  const records = progress?.records || {};
  Object.values(records).forEach((byLevel) => {
    Object.values(byLevel).forEach((rec) => {
      sum += rec.stars || 0;
    });
  });
  return sum;
}

/** Estrelas somadas em uma categoria (para os cartões do menu). */
export function categoryStars(progress, categoryId) {
  const byLevel = progress?.records?.[categoryId] || {};
  return Object.values(byLevel).reduce((sum, rec) => sum + (rec.stars || 0), 0);
}

/** Começa do zero (usado em Configurações, com confirmação). */
export function resetProgress() {
  return createEmptyProgress();
}
