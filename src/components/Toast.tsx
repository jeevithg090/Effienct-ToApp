import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useTheme } from '../theme';
import { Touchable } from './Touchable';

interface ToastProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  durationMs?: number;
  bottomInset?: number;
}

/** Transient status message with an optional action (e.g. "Undo"). */
export function Toast({
  message,
  actionLabel,
  onAction,
  onDismiss,
  durationMs = 5000,
  bottomInset = 0,
}: ToastProps) {
  const { colors, dark } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: false }).start();
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs, onDismiss, opacity]);

  const background = dark ? colors.surfaceMuted : colors.text;
  const foreground = dark ? colors.text : colors.surface;

  return (
    <View style={[styles.wrap, { bottom: spacing.lg + bottomInset }]}>
      <Animated.View
        role="status"
        aria-live="polite"
        style={[styles.toast, { backgroundColor: background, opacity, borderColor: colors.border }]}
      >
        <Text style={[styles.message, { color: foreground }]}>{message}</Text>
        {actionLabel && onAction ? (
          <Touchable
            role="button"
            aria-label={actionLabel}
            onPress={onAction}
            style={styles.action}
          >
            <Text style={[styles.actionText, { color: dark ? colors.primary : '#9CC0FF' }]}>
              {actionLabel}
            </Text>
          </Touchable>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    maxWidth: 480,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    boxShadow: '0 8px 24px rgba(16, 24, 40, 0.25)',
  },
  message: { ...typography.body, fontSize: 15, flex: 1, paddingVertical: spacing.sm },
  action: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  actionText: { ...typography.label, fontSize: 15 },
});
