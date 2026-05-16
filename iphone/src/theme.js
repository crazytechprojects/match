import { Platform } from 'react-native';

const palette = {
  coral: '#e87560',
  coralLight: '#f5a898',
  coralSoft: 'rgba(232, 117, 96, 0.08)',
  coralMuted: 'rgba(232, 117, 96, 0.15)',

  green: '#37d399',
  greenSoft: 'rgba(55, 211, 153, 0.10)',
  greenBorder: 'rgba(55, 211, 153, 0.30)',

  yellow: '#f5c344',
  yellowSoft: 'rgba(245, 195, 68, 0.10)',
  yellowBorder: 'rgba(245, 195, 68, 0.30)',

  red: '#f04438',
  redSoft: 'rgba(240, 68, 56, 0.08)',
  redBorder: 'rgba(240, 68, 56, 0.30)',

  white: '#FFFFFF',
  bg: '#FBF8F6',
  bgCard: '#FFFFFF',
  bgElevated: '#F5F1EE',
  border: '#E8E2DD',
  borderLight: '#F0EBE7',

  text: '#1C1917',
  textSecondary: '#57534E',
  textMuted: '#78716C',
  textDim: '#A8A29E',
  textOnCoral: '#FFFFFF',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 32,
  hero: 42,
};

const font = {
  regular: Platform.select({ ios: 'System', default: 'System' }),
  medium: Platform.select({ ios: 'System', default: 'System' }),
  semibold: Platform.select({ ios: 'System', default: 'System' }),
  bold: Platform.select({ ios: 'System', default: 'System' }),
  serif: Platform.select({ ios: 'Georgia', default: 'serif' }),
  mono: Platform.select({ ios: 'Menlo', default: 'monospace' }),
};

const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
};

const GLYPH_GRADIENTS = [
  ['#e87560', '#7a2c1f'],
  ['#d4a017', '#5c3a0a'],
  ['#9c5db0', '#3d1d4a'],
  ['#5b8def', '#1a2e5c'],
  ['#37d399', '#0e4a36'],
  ['#e3577a', '#5a1230'],
  ['#f29a5e', '#5c2916'],
  ['#7a9d6e', '#2b4226'],
];

export default {
  palette,
  spacing,
  radius,
  fontSize,
  font,
  shadow,
  GLYPH_GRADIENTS,
};
