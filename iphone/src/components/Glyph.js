import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

const SIZES = {
  sm: { box: 32, font: 13 },
  md: { box: 42, font: 17 },
  lg: { box: 56, font: 22 },
  xl: { box: 72, font: 30 },
};

export default function Glyph({ seed = 'x', letter, size = 'md', style }) {
  const idx = hashStr(seed) % theme.GLYPH_GRADIENTS.length;
  const [c1, c2] = theme.GLYPH_GRADIENTS[idx];
  const dim = SIZES[size] || SIZES.md;
  const initial = (letter || seed[0] || '?').toUpperCase();

  return (
    <LinearGradient
      colors={[c1, c2]}
      start={{ x: 0.2, y: 0.1 }}
      end={{ x: 0.9, y: 0.9 }}
      style={[
        {
          width: dim.box,
          height: dim.box,
          borderRadius: dim.box / 2,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text
        style={{
          color: '#fff',
          fontSize: dim.font,
          fontWeight: '600',
          letterSpacing: 0.5,
        }}
      >
        {initial}
      </Text>
    </LinearGradient>
  );
}

export { hashStr };
