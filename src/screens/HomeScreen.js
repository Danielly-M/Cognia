import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BigButton from '../components/BigButton';
import ScreenShell from '../components/ScreenShell';
import { useProgress } from '../state/AppStateContext';
import { totalStars } from '../state/progress';
import { colors, font, spacing } from '../theme/tokens';

/**
 * Tela inicial: três possibilidades, sempre nas mesmas posições.
 * Nada de animações de boas-vindas, contagens ou surpresas.
 */
export default function HomeScreen({ navigation }) {
  const { progress } = useProgress();
  const stars = totalStars(progress);

  return (
    <ScreenShell title="Cognia" testID="home-screen">
      <View style={styles.hero}>
        <View style={styles.logoRow} accessibilityElementsHidden>
          <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          <View style={[styles.dot, { backgroundColor: '#7FA65A' }]} />
          <View style={[styles.dot, { backgroundColor: '#E3BE5C' }]} />
        </View>
        <Text style={styles.tagline}>Jogo de pareamento para descobrir cores, formas e animais</Text>
      </View>

      <View style={styles.actions}>
        <BigButton label="Jogar" onPress={() => navigation.navigate('Categorias')} testID="home-play" />
        <BigButton
          label="Configurações"
          variant="secondary"
          onPress={() => navigation.navigate('Configuracoes')}
          testID="home-settings"
        />
      </View>

      <Text style={styles.starsLine} accessibilityLabel={`${stars} estrelas conquistadas até agora`}>
        {stars > 0 ? `★ ${stars} estrelas conquistadas` : '★ Ganhe estrelas jogando'}
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: spacing.xxl },
  logoRow: { flexDirection: 'row', marginBottom: spacing.lg },
  dot: { width: 28, height: 28, borderRadius: 14, marginHorizontal: spacing.sm },
  tagline: {
    fontSize: font.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: 26,
  },
  actions: { marginTop: spacing.xl, paddingHorizontal: spacing.sm },
  starsLine: {
    marginTop: spacing.lg,
    textAlign: 'center',
    fontSize: font.body,
    color: colors.textMuted,
  },
});
