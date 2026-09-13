import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View, StyleSheet } from 'react-native';
import Glyph from './Glyph';
import { colors, motion, sizes, spacing } from '../theme/tokens';

/**
 * Carta do jogo de pareamento.
 *
 * Acessibilidade: o estado da carta é SEMPRE anunciado por texto
 * ("Carta fechada" / "Carta virada: Cachorro" / "Par encontrado: ..."),
 * então a informação nunca depende apenas de cor ou animação.
 *
 * Movimento: ao virar, um crescimento breve (240ms) pode ser desligado
 * no Configurações ("Animações reduzidas").
 */
export default function GameCard({
  card,
  index,
  onPress,
  size,
  interactive = true,
  reduceMotion = false,
  showLabels = true,
}) {
  const reveal = useRef(new Animated.Value(1)).current;
  const wasFaceUp = useRef(card.faceUp);

  useEffect(() => {
    if (!wasFaceUp.current && !card.faceUp) return;
    if (wasFaceUp.current !== card.faceUp && card.faceUp && !reduceMotion) {
      reveal.setValue(0.85);
      Animated.timing(reveal, {
        toValue: 1,
        duration: motion.pop,
        useNativeDriver: true,
      }).start();
    }
    wasFaceUp.current = card.faceUp;
  }, [card.faceUp, reduceMotion, reveal]);

  const revealed = card.faceUp || card.matched;
  const disabled = !interactive || card.matched;

  function accessibilityLabel() {
    if (card.matched) return `Par encontrado: ${card.label}`;
    if (card.faceUp) return `Carta virada: ${card.label}`;
    return 'Carta fechada';
  }

  return (
    <Pressable
      testID={`card-${index}`}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel()}
      accessibilityState={{ selected: revealed, disabled }}
      disabled={disabled}
      onPress={() => onPress(index)}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size },
        revealed ? styles.faceUp : styles.cover,
        card.matched && styles.matched,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {/* Conteúdo da face só EXISTE quando revelado: carta fechada não dá
          spoiler nem para quem usa leitor de tela. */}
      {revealed ? (
        <Animated.View style={[styles.inner, { transform: [{ scale: reveal }] }]}>
          <Glyph
            kind={card.kind}
            color={card.color}
            shape={card.shape}
            emoji={card.emoji}
            size={size}
          />
          {showLabels && card.label ? (
            <Text style={styles.label} numberOfLines={1} allowFontScaling={false}>
              {card.label}
            </Text>
          ) : null}
        </Animated.View>
      ) : (
        <View style={styles.coverDot} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: sizes.cardRadius,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.outline,
    overflow: 'hidden',
  },
  cover: { backgroundColor: colors.tileCover },
  faceUp: { backgroundColor: colors.surface },
  matched: { backgroundColor: colors.successSoft, borderColor: colors.success },
  pressed: { opacity: 0.85 },
  inner: { alignItems: 'center', justifyContent: 'center' },
  coverDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
