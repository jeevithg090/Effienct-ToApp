import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useTheme } from '../theme';
import { IconButton } from './IconButton';

interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** Centered modal dialog with a dimmed backdrop. Tapping the backdrop or pressing Escape closes it. */
export function Sheet({ visible, title, onClose, children }: SheetProps) {
  const { colors } = useTheme();
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
          onPress={onClose}
          aria-label="Close dialog"
          accessible={false}
          tabIndex={-1}
        />
        <View
          role="dialog"
          aria-modal
          aria-label={title}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.header}>
            <Text role="heading" style={[styles.title, { color: colors.text }]}>
              {title}
            </Text>
            <IconButton icon="close" label="Close" color={colors.textMuted} onPress={onClose} />
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
    boxShadow: '0 12px 32px rgba(16, 24, 40, 0.24)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: -spacing.sm,
    marginTop: -spacing.sm,
  },
  title: { ...typography.title },
});
