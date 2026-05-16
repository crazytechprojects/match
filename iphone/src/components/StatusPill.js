import { View, Text } from 'react-native';
import theme from '../theme';
import StatusDot from './StatusDot';

const LABELS = {
  green: 'Mutual match',
  yellow: 'They passed',
  red: 'Mutual no',
};

const BG = {
  green: theme.palette.greenSoft,
  yellow: theme.palette.yellowSoft,
  red: theme.palette.redSoft,
};

export default function StatusPill({ status, style }) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: BG[status] || theme.palette.bgElevated,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: theme.radius.full,
        },
        style,
      ]}
    >
      <StatusDot status={status} size={6} />
      <Text
        style={{
          fontSize: theme.fontSize.xs,
          fontWeight: '600',
          color: theme.palette.textSecondary,
          letterSpacing: 0.3,
        }}
      >
        {LABELS[status] || status}
      </Text>
    </View>
  );
}
