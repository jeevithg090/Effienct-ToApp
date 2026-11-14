import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text } from 'react-native';

import { radius, spacing, typography, TOUCH_TARGET, useTheme } from '../theme';
import { Touchable, type TouchableProps } from './Touchable';

type IconName = ComponentProps<typeof Ionicons>['name'];

export interface ButtonProps extends Omit<TouchableProps, 'children'> {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: IconName;
}

export function Button({ label, variant = 'primary', icon, style, ...rest }: ButtonProps) {
  const { colors } = useTheme();
  const palette = {
    primary: { bg: colors.primary, fg: colors.textInverse, border: colors.primary },
    secondary: { bg: colors.surface, fg: colors.text, border: colors.border },
    ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
    danger: { bg: 'transparent', fg: colors.danger, border: 'transparent' },
  }[variant];

  return (
    <Touchable
      role="button"
      aria-label={rest['aria-label'] ?? label}
      {...rest}
      style={(state) => [
        styles.base,
        { backgroundColor: palette.bg, borderColor: palette.border },
        variant === 'primary' && state.pressed && { backgroundColor: colors.primaryPressed },
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={palette.fg} aria-hidden /> : null}
      <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: TOUCH_TARGET,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    fontSize: 15,
  },
});
