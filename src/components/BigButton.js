import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, font, radius, sizes, spacing } from '../theme/tokens';

/**
 * Botão principal do app.
 *
 * Decisões de UX:
 * - Altura fixa de 64pt (alvo de toque grande e sempre igual).
 * - Sem animação de escala: feedback apenas por cor (previsível).
 * - `label` obrigatório; leitores de tela recebem exatamente o mesmo texto.
 */
export default function BigButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityLabel,
  style,
  testID,
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'secondary' && styles.labelSecondary,
          variant === 'ghost' && styles.labelSecondary,
        ]}
        allowFontScaling
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: sizes.touch,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.outline,
  },
  ghost: { backgroundColor: 'transparent' },
  danger: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.outline,
  },
  pressed: { backgroundColor: colors.primaryPressed },
  disabled: { opacity: 0.45 },
  label: {
    color: colors.textOnPrimary,
    fontSize: font.button,
    fontWeight: '700',
  },
  labelSecondary: { color: colors.text },
});
