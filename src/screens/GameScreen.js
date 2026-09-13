import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import BigButton from '../components/BigButton';
import GameCard from '../components/GameCard';
import ScreenShell from '../components/ScreenShell';
import StarRow from '../components/StarRow';
import { gameSounds } from '../audio/sounds';
import { createGameState, gameReducer, selectedIsMatch } from '../game/engine';
import { buildDeck } from '../game/deck';
import { getCategory, getNextLevel, getLevel } from '../game/levels';
import { starsFor } from '../game/scoring';
import { useProgress, useSettings } from '../state/AppStateContext';
import { colors, font, motion, radius, sizes, spacing } from '../theme/tokens';

/**
 * Tela do jogo de pareamento.
 *
 * Regras de UX desta tela:
 * - Sem cronômetro, sem vidas, sem "fim de jogo". Só existe continuar.
 * - Cartas não-combinadas voltam devagar (900ms) — a criança TEMPO de ver
 *   as duas figuras antes de qualquer coisa mudar.
 * - Ao vencer: celebração breve e gentil; estrelas nunca diminuem.
 */
export default function GameScreen({ navigation, route }) {
  const { categoryId, levelId } = route.params || {};
  const category = getCategory(categoryId);
  const level = getLevel(levelId);
  const { settings } = useSettings();
  const { completeLevel } = useProgress();
  const { width } = useWindowDimensions();

  const makeDeck = useCallback(
    () => (category && level ? buildDeck(category, level) : []),
    [category, level],
  );
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createGameState(makeDeck()),
  );
  const recordedRef = useRef(false);

  // Parâmetros inválidos: retorna sozinho (nunca mostrar erro para a criança).
  useEffect(() => {
    if (!category || !level) navigation.goBack();
  }, [category, level, navigation]);

  const play = useCallback(
    (name) => {
      if (settings.sound) gameSounds.play(name);
    },
    [settings.sound],
  );

  // Resolve a dupla virada após uma pausa calma e dá o feedback sonoro.
  useEffect(() => {
    if (state.status !== 'resolving') return undefined;
    const match = selectedIsMatch(state);
    const timer = setTimeout(() => {
      dispatch({ type: 'resolve' });
      play(match ? 'acerto' : 'erro');
    }, motion.revealDelay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, play]);

  // Vitória: registra a conquista (uma única vez por partida).
  useEffect(() => {
    if (state.status === 'won' && !recordedRef.current && level) {
      recordedRef.current = true;
      completeLevel(categoryId, levelId, starsFor(state.moves, level.pairs));
      play('vitoria');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  const stars = useMemo(
    () => (state.status === 'won' && level ? starsFor(state.moves, level.pairs) : 0),
    [state.status, state.moves, level],
  );

  if (!category || !level) return null;

  const handlePress = (index) => dispatch({ type: 'flip', index });
  const interactive = state.status === 'idle';

  const restart = () => {
    recordedRef.current = false;
    dispatch({ type: 'restart', deck: makeDeck() });
  };
  const goHome = () => navigation.popToTop();
  const next = getNextLevel(levelId);

  // Grade: colunas fixas por nível; cartas quadradas e do MESMO tamanho.
  const contentWidth = width - spacing.md * 2;
  const cardSize = Math.min(
    Math.floor((contentWidth - (level.cols - 1) * sizes.cardGap) / level.cols),
    150,
  );
  const entries = state.cards.map((card, index) => ({ card, index }));
  const rows = [];
  for (let i = 0; i < entries.length; i += level.cols) {
    rows.push(entries.slice(i, i + level.cols));
  }

  return (
    <ScreenShell title={`${category.label} · ${level.label}`} onBack={() => navigation.goBack()}>
      <Text style={styles.progress} accessibilityLiveRegion="polite">
        {state.matchedCount} de {level.pairs} pares encontrados
      </Text>

      <View style={styles.board} accessibilityLabel="Tabuleiro do jogo de pareamento">
        {rows.map((row, rowIdx) => (
          <View key={`row-${rowIdx}`} style={styles.row}>
            {row.map(({ card, index }) => (
              <GameCard
                key={card.key}
                card={card}
                index={index}
                onPress={handlePress}
                size={cardSize}
                interactive={interactive}
                reduceMotion={settings.reduceMotion}
                showLabels={settings.showLabels}
              />
            ))}
          </View>
        ))}
      </View>

      {state.status === 'won' ? (
        <View style={styles.overlay}>
          <View style={styles.panel}>
            <Text style={styles.winTitle}>Muito bem!</Text>
            <StarRow count={stars} size={40} style={styles.winStars} />
            <Text style={styles.winMoves}>
              Você terminou com {state.moves} {state.moves === 1 ? 'jogadinha' : 'jogadinhas'}
            </Text>
            {next ? (
              <BigButton
                label="Próximo nível"
                onPress={() => navigation.replace('Jogo', { categoryId, levelId: next.id })}
                testID="win-next"
              />
            ) : null}
            <BigButton
              label="Jogar de novo"
              variant="secondary"
              onPress={restart}
              testID="win-replay"
            />
            <BigButton label="Voltar ao início" variant="ghost" onPress={goHome} testID="win-home" />
          </View>
        </View>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  progress: {
    textAlign: 'center',
    fontSize: font.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  board: {
    alignSelf: 'center',
    marginTop: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: sizes.cardGap,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  panel: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  winTitle: { fontSize: font.huge, fontWeight: '800', color: colors.text },
  winStars: { marginVertical: spacing.md },
  winMoves: { fontSize: font.body, color: colors.textMuted, marginBottom: spacing.sm },
});
