import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import theme from '../theme';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  children,
}) {
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const baseStyle = [
    styles.base,
    styles[variant],
    size === 'lg' && styles.lg,
    size === 'sm' && styles.sm,
    isDisabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    styles[`${variant}Label`],
    size === 'lg' && styles.lgLabel,
    size === 'sm' && styles.smLabel,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={baseStyle}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? theme.palette.textOnCoral : theme.palette.coral}
        />
      ) : children ? (
        children
      ) : (
        <Text style={labelStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: 14,
    gap: theme.spacing.sm,
  },
  primary: {
    backgroundColor: theme.palette.coral,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.palette.border,
  },
  soft: {
    backgroundColor: theme.palette.bgElevated,
  },
  danger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.palette.redBorder,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.radius.lg,
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.sm,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  primaryLabel: {
    color: theme.palette.textOnCoral,
  },
  ghostLabel: {
    color: theme.palette.text,
  },
  softLabel: {
    color: theme.palette.text,
  },
  dangerLabel: {
    color: theme.palette.red,
  },
  lgLabel: {
    fontSize: theme.fontSize.md,
  },
  smLabel: {
    fontSize: theme.fontSize.sm,
  },
});
