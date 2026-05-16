import { View } from 'react-native';
import theme from '../theme';

const COLORS = {
  green: theme.palette.green,
  yellow: theme.palette.yellow,
  red: theme.palette.red,
};

export default function StatusDot({ status, size = 8, style }) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: COLORS[status] || theme.palette.textDim,
        },
        style,
      ]}
    />
  );
}
