import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useTheme } from '../theme';
import type { TodoFilter } from '../types/todo';
import { Touchable } from './Touchable';

interface FilterTabsProps {
  value: TodoFilter;
  counts: Record<TodoFilter, number>;
  onChange: (filter: TodoFilter) => void;
}

const OPTIONS: { value: TodoFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Done' },
];

export function FilterTabs({ value, counts, onChange }: FilterTabsProps) {
  const { colors } = useTheme();
  return (
    <View
      role="tablist"
      aria-label="Filter tasks"
      style={[styles.container, { backgroundColor: colors.surfaceMuted }]}
    >
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Touchable
            key={option.value}
            role="tab"
            aria-selected={selected}
            aria-label={`${option.label}, ${counts[option.value]} tasks`}
            onPress={() => onChange(option.value)}
            style={[
              styles.tab,
              selected && [styles.tabSelected, { backgroundColor: colors.surface }],
            ]}
          >
            <Text style={[styles.label, { color: selected ? colors.text : colors.textMuted }]}>
              {option.label}
            </Text>
            <View
              style={[
                styles.badge,
                { backgroundColor: selected ? colors.primarySoft : colors.surface },
              ]}
            >
              <Text
                style={[styles.badgeText, { color: selected ? colors.primary : colors.textMuted }]}
              >
                {counts[option.value]}
              </Text>
            </View>
          </Touchable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  tabSelected: {
    boxShadow: '0 1px 2px rgba(16, 24, 40, 0.12)',
  },
  label: { ...typography.label },
  badge: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  badgeText: { ...typography.caption, fontSize: 12, fontVariant: ['tabular-nums'] },
});
