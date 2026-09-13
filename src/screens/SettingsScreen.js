import React from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import BigButton from '../components/BigButton';
import ScreenShell from '../components/ScreenShell';
import { gameSounds } from '../audio/sounds';
import { useProgress, useSettings } from '../state/AppStateContext';
import { colors, font, radius, spacing } from '../theme/tokens';

/**
 * Configurações: cada opção tem nome claro + explicação em linguagem simples.
 * Nenhuma opção é obrigatória; tudo tem padrão sensível.
 */
export default function SettingsScreen({ navigation }) {
  const { settings, setSetting } = useSettings();
  const { resetProgress } = useProgress();

  function confirmReset() {
    Alert.alert(
      'Apagar as estrelas?',
      'As estrelas e os níveis abertos vão voltar ao começo. O jogo continua igual de divertido.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => resetProgress(),
        },
      ],
    );
  }

  return (
    <ScreenShell title="Configurações" onBack={() => navigation.goBack()} testID="settings-screen">
      <Text style={styles.section}>Som</Text>
      <SettingRow
        title="Sons do jogo"
        description="Sons curtos e suaves quando você vira as cartas."
        value={settings.sound}
        onValueChange={(v) => setSetting('sound', v)}
        testID="setting-sound"
      />
      {settings.sound ? (
        <BigButton
          label="Ouvir um exemplo"
          variant="ghost"
          onPress={() => gameSounds.play('acerto')}
          testID="settings-sound-demo"
        />
      ) : null}

      <Text style={styles.section}>Movimento</Text>
      <SettingRow
        title="Animações reduzidas"
        description="As cartas aparecem direto, sem movimento."
        value={settings.reduceMotion}
        onValueChange={(v) => setSetting('reduceMotion', v)}
        testID="setting-motion"
      />

      <Text style={styles.section}>Textos</Text>
      <SettingRow
        title="Nome nas cartas"
        description="Mostra o nome de cada figura escrito na carta."
        value={settings.showLabels}
        onValueChange={(v) => setSetting('showLabels', v)}
        testID="setting-labels"
      />

      <Text style={styles.section}>Começar de novo</Text>
      <BigButton
        label="Apagar minhas estrelas"
        variant="danger"
        onPress={confirmReset}
        testID="settings-reset"
      />

      <Text style={styles.about}>
        Cognia é um jogo de pareamento criado para crianças autistas: sem pressa, sem vermelho
        de erro e sem surpresas. Bom jogo!
      </Text>
    </ScreenShell>
  );
}

function SettingRow({ title, description, value, onValueChange, testID }) {
  return (
    <View style={styles.row}>
      <Pressable
        style={styles.rowTexts}
        accessibilityRole="switch"
        accessibilityLabel={title}
        accessibilityValue={{ label: value ? 'ligado' : 'desligado' }}
        accessibilityState={{ checked: value }}
        onPress={() => onValueChange(!value)}
        testID={`${testID}-row`}
      >
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </Pressable>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.outline, true: colors.primary }}
        thumbColor={colors.surface}
        accessibilityLabel={title}
        testID={testID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    fontSize: font.label,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.outline,
    padding: spacing.md,
    minHeight: 80,
    marginVertical: spacing.xs,
  },
  rowTexts: { flex: 1, paddingRight: spacing.md },
  rowTitle: { fontSize: font.body, fontWeight: '700', color: colors.text },
  rowDescription: { fontSize: font.label, color: colors.textMuted, marginTop: 2 },
  about: {
    fontSize: font.label,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 22,
  },
});
