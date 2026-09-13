import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import StarRow from '../components/StarRow';
import { getCategory, LEVELS } from '../game/levels';
import { useProgress } from '../state/AppStateContext';
import { bestStarsFor, isLevelUnlockedFor } from '../state/progress';
import { colors, font, radius, spacing } from '../theme/tokens';

/**
 * Escolha de nível. Desbloqueio sempre explicado com texto gentil
 * (nunca um cadeado mudo).
 */
export default function LevelsScreen({ navigation, route }) {
  const { categoryId } = route.params;
  const category = getCategory(categoryId);
  const { progress } = useProgress();

  // Categoria inválida: volta sozinha, sem tela de erro para a criança.
  useEffect(() => {
    if (!category) navigation.goBack();
  }, [category, navigation]);

  if (!category) return null;

  return (
    <ScreenShell title={category.label} onBack={() => navigation.goBack()} testID="levels-screen">
      {LEVELS.map((level, index) => {
        const unlocked = isLevelUnlockedFor(progress, categoryId, LEVELS, index);
        const stars = bestStarsFor(progress, categoryId, level.id);
        return (
          <Pressable
            key={level.id}
            accessibilityRole="button"
            accessibilityLabel={`${level.label}. ${level.pairs * 2} cartas. ${
              unlocked ? `${stars} estrelas conquistadas` : 'Bloqueado. Termine o nível anterior primeiro'
            }`}
            accessibilityState={{ disabled: !unlocked }}
            disabled={!unlocked}
            onPress={() => navigation.navigate('Jogo', { categoryId, levelId: level.id })}
            style={({ pressed }) => [
              styles.card,
              !unlocked && styles.locked,
              pressed && unlocked && styles.pressed,
            ]}
            testID={`level-${level.id}`}
          >
            <View style={styles.left}>
              <Text style={styles.levelLabel}>{level.label}</Text>
              <Text style={styles.help}>
                {level.pairs * 2} cartas · {level.help.toLowerCase()}
              </Text>
              {!unlocked ? (
                <Text style={styles.lockHint}>Termine o nível anterior para abrir este</Text>
              ) : null}
            </View>
            {unlocked ? (
              <StarRow count={stars} />
            ) : (
              <Text style={styles.lockIcon} accessibilityElementsHidden>
                🔒
              </Text>
            )}
          </Pressable>
        );
      })}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.outline,
    padding: spacing.md,
    minHeight: 92,
    marginVertical: spacing.sm,
  },
  locked: { opacity: 0.55 },
  pressed: { backgroundColor: colors.surfaceMuted },
  left: { flex: 1 },
  levelLabel: { fontSize: font.heading, fontWeight: '700', color: colors.text },
  help: { fontSize: font.label, color: colors.textMuted, marginTop: 2 },
  lockHint: { fontSize: font.label, color: colors.textMuted, marginTop: 4, fontStyle: 'italic' },
  lockIcon: { fontSize: 28 },
});
