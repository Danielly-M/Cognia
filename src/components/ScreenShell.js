import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, sizes, spacing } from '../theme/tokens';

/**
 * Casca única de todas as telas: mesmo cabeçalho, mesmas margens,
 * mesma posição do botão "Voltar" (canto superior esquerdo, sempre).
 * Previsibilidade é acessibilidade.
 */
export default function ScreenShell({ title, onBack, right, children, testID }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']} testID={testID}>
      <View style={styles.header}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={onBack}
            hitSlop={8}
            style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
          >
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
        ) : (
          <View style={styles.backSpacer} />
        )}
        <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
        <View style={styles.right}>{right}</View>
      </View>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    minHeight: sizes.touch,
  },
  back: {
    width: sizes.touchSecondary,
    height: sizes.touchSecondary,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPressed: { backgroundColor: colors.surfaceMuted },
  backIcon: { fontSize: 26, color: colors.text, lineHeight: 30 },
  backSpacer: { width: sizes.touchSecondary },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: font.heading,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.sm,
  },
  right: { width: sizes.touchSecondary, alignItems: 'flex-end' },
  content: { flex: 1, paddingHorizontal: spacing.md },
});
