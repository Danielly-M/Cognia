import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, sizes } from '../theme/tokens';

/**
 * Três estrelas de conquista (0–3).
 * Sempre as três posições fixas — previsível; preenchidas = conquista.
 */
export default function StarRow({ count = 0, size = sizes.starIcon, style, testID }) {
  const safe = Math.max(0, Math.min(3, count));
  return (
    <View
      row
      testID={testID}
      accessible
      accessibilityLabel={`${safe} de 3 estrelas`}
      style={style}
    >
      {[0, 1, 2].map((i) => (
        <Text key={i} style={[styles.star, { fontSize: size }, i < safe ? styles.on : styles.off]}>
          {i < safe ? '★' : '☆'}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  star: { lineHeight: undefined },
  on: { color: colors.star },
  off: { color: colors.starOff },
});
