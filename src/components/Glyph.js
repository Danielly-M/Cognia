import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/tokens';

/**
 * Desenha o conteúdo visual de uma carta/par.
 *
 * - 'color': amostra de cor (o rótulo por extenso acompanha na carta).
 * - 'shape': formas geométricas desenhadas com View, sempre na MESMA cor
 *   de tinta — assim a única variável é a forma (uma por vez).
 * - 'emoji': figura única (animais).
 *
 * Nenhuma imagem externa: renderização idêntica em qualquer aparelho,
 * zero peso de assets.
 */
const INK = '#5C6670';

export default function Glyph({ kind, color, shape, emoji, size, style }) {
  if (kind === 'color') {
    return (
      <View
        style={[
          styles.fill,
          { width: size * 0.72, height: size * 0.72, backgroundColor: color, borderRadius: size * 0.16 },
          style,
        ]}
      />
    );
  }

  if (kind === 'emoji') {
    return (
      <Text style={[styles.emoji, { fontSize: size * 0.52 }, style]} allowFontScaling={false}>
        {emoji}
      </Text>
    );
  }

  // kind === 'shape'
  switch (shape) {
    case 'circle':
      return <View style={shapeBox(size * 0.66, size * 0.66, { borderRadius: size })} />;
    case 'square':
      return <View style={shapeBox(size * 0.6, size * 0.6, { borderRadius: 6 })} />;
    case 'rectangle':
      return <View style={shapeBox(size * 0.78, size * 0.46, { borderRadius: 6 })} />;
    case 'triangle': {
      const w = size * 0.72;
      const h = size * 0.62;
      return (
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: w / 2,
            borderRightWidth: w / 2,
            borderBottomWidth: h,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: INK,
          }}
        />
      );
    }
    case 'diamond':
      return (
        <View
          style={[shapeBox(size * 0.46, size * 0.46, { borderRadius: 6 }), { transform: [{ rotate: '45deg' }] }]}
        />
      );
    case 'plus': {
      const arm = size * 0.2;
      const len = size * 0.66;
      return (
        <View style={{ width: len, height: len }}>
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: (len - arm) / 2,
              width: len,
              height: arm,
              backgroundColor: INK,
              borderRadius: 4,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: (len - arm) / 2,
              width: arm,
              height: len,
              backgroundColor: INK,
              borderRadius: 4,
            }}
          />
        </View>
      );
    }
    default:
      return <View style={shapeBox(size * 0.6, size * 0.6, { borderRadius: 6 })} />;
  }
}

function shapeBox(width, height, extra) {
  return { width, height, backgroundColor: INK, ...extra };
}

const styles = StyleSheet.create({
  fill: {},
  emoji: { color: colors.text },
});
