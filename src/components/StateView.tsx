import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { spacing, typography, useTheme } from '../theme';

interface StateViewProps {
  icon?: ComponentProps<typeof Ionicons>['name'];
  loading?: boolean;
  title: string;
  message?: string;
  action?: ReactNode;
  tone?: 'neutral' | 'danger';
}

/** Centered illustration + copy used for loading, empty and error states. */
export function StateView({
  icon,
  loading,
  title,
  message,
  action,
  tone = 'neutral',
}: StateViewProps) {
  const { colors } = useTheme();
  const accent = tone === 'danger' ? colors.danger : colors.primary;
  return (
    <View style={styles.root} role={tone === 'danger' ? 'alert' : undefined} aria-busy={loading}>
      {loading ? (
        <ActivityIndicator size="large" color={accent} />
      ) : icon ? (
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: tone === 'danger' ? colors.dangerSoft : colors.primarySoft },
          ]}
        >
          <Ionicons name={icon} size={28} color={accent} aria-hidden />
        </View>
      ) : null}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {message ? (
        <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
      ) : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: { ...typography.heading, textAlign: 'center' },
  message: { ...typography.body, fontSize: 15, textAlign: 'center', maxWidth: 320 },
});
