import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { CATEGORIES } from '../game/levels';
import { useProgress } from '../state/AppStateContext';
import { categoryStars } from '../state/progress';
import { colors, font, radius, spacing } from '../theme/tokens';

const HELP = {
  cores: 'Encontre as cores iguais',
  formas: 'Encontre as formas iguais',
  animais: 'Encontre os animais iguais',
};

/**
 * Escolha de categoria: exatamente UMA variável por tela.
 * Cada cartão anuncia estrelas conquistadas (conquista, não meta).
 */
export default function CategoriesScreen({ navigation }) {
  const { progress } = useProgress();

  return (
    <ScreenShell
      title="O que vamos jogar?"
      onBack={() => navigation.goBack()}
      testID="categories-screen"
    >
      {CATEGORIES.map((cat) => {
        const stars = categoryStars(progress, cat.id);
        return (
          <Pressable
            key={cat.id}
            accessibilityRole="button"
            accessibilityLabel={`${cat.label}. ${HELP[cat.id]}. ${stars} estrelas`}
            onPress={() => navigation.navigate('Niveis', { categoryId: cat.id })}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            testID={`category-${cat.id}`}
          >
            <View style={[styles.icon, { backgroundColor: cat.preview }]} />
            <View style={styles.texts}>
              <Text style={styles.label}>{cat.label}</Text>
              <Text style={styles.help}>{HELP[cat.id]}</Text>
            </View>
            <Text style={styles.stars} accessibilityElementsHidden>
              {stars > 0 ? `★ ${stars}` : ''}
            </Text>
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
  pressed: { backgroundColor: colors.surfaceMuted },
  icon: { width: 48, height: 48, borderRadius: 14 },
  texts: { flex: 1, marginHorizontal: spacing.md },
  label: { fontSize: font.heading, fontWeight: '700', color: colors.text },
  help: { fontSize: font.label, color: colors.textMuted, marginTop: 2 },
  stars: { fontSize: font.body, color: colors.star, fontWeight: '700', minWidth: 44, textAlign: 'right' },
});
