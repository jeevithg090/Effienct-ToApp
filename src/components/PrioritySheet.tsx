import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { priorityLabel } from '../lib/format';
import { radius, spacing, typography, TOUCH_TARGET, useTheme } from '../theme';
import { PRIORITIES, type Priority } from '../types/todo';
import { Sheet } from './Sheet';
import { Touchable } from './Touchable';

interface PrioritySheetProps {
  visible: boolean;
  current?: Priority;
  onSelect: (priority: Priority) => void;
  onClose: () => void;
}

const DESCRIPTIONS: Record<Priority, string> = {
  high: 'Do this first',
  medium: 'Important, not urgent',
  low: 'Nice to get to',
};

export function PrioritySheet({ visible, current, onSelect, onClose }: PrioritySheetProps) {
  const { colors } = useTheme();
  return (
    <Sheet visible={visible} title="Set priority" onClose={onClose}>
      <View role="radiogroup" aria-label="Priority" style={styles.list}>
        {PRIORITIES.map((priority) => {
          const tone = colors.priority[priority];
          const selected = priority === current;
          return (
            <Touchable
              key={priority}
              role="radio"
              aria-checked={selected}
              aria-label={`${priorityLabel(priority)} priority`}
              onPress={() => onSelect(priority)}
              style={[
                styles.option,
                {
                  borderColor: selected ? tone.solid : colors.border,
                  backgroundColor: selected ? tone.soft : colors.surface,
                },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: tone.solid }]} />
              <View style={styles.optionBody}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  {priorityLabel(priority)}
                </Text>
                <Text style={[styles.optionDesc, { color: colors.textMuted }]}>
                  {DESCRIPTIONS[priority]}
                </Text>
              </View>
              {selected ? (
                <Ionicons name="checkmark-circle" size={22} color={tone.solid} aria-hidden />
              ) : null}
            </Touchable>
          );
        })}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: TOUCH_TARGET + spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  optionBody: { flex: 1 },
  optionTitle: { ...typography.heading, fontSize: 16 },
  optionDesc: { ...typography.caption },
});
