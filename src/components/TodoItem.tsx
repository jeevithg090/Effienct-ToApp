import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { priorityLabel } from '../lib/format';
import { categoryColorIndex } from '../lib/todos';
import { radius, spacing, typography, TOUCH_TARGET, useTheme } from '../theme';
import { UNCATEGORIZED, type Todo } from '../types/todo';
import { IconButton } from './IconButton';
import { Touchable } from './Touchable';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEditPriority: (id: string) => void;
}

export const TodoItem = memo(function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEditPriority,
}: TodoItemProps) {
  const { colors } = useTheme();
  const priority = colors.priority[todo.priority];
  const categoryColors =
    colors.categories[categoryColorIndex(todo.category, colors.categories.length)];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftColor: priority.solid,
        },
        todo.completed && { backgroundColor: colors.surfaceMuted },
      ]}
    >
      <Touchable
        role="checkbox"
        aria-checked={todo.completed}
        aria-label={todo.text}
        onPress={() => onToggle(todo.id)}
        onLongPress={() => onDelete(todo.id)}
        style={styles.main}
      >
        <View
          style={[
            styles.check,
            { borderColor: todo.completed ? colors.success : colors.borderStrong },
            todo.completed && { backgroundColor: colors.success },
          ]}
        >
          {todo.completed ? (
            <Ionicons name="checkmark" size={16} color={colors.surface} aria-hidden />
          ) : null}
        </View>
        <View style={styles.body}>
          <Text
            style={[
              styles.text,
              { color: todo.completed ? colors.textMuted : colors.text },
              todo.completed && styles.textCompleted,
            ]}
          >
            {todo.text}
          </Text>
          <View style={styles.meta}>
            <View style={[styles.pill, { backgroundColor: priority.soft }]}>
              <View style={[styles.dot, { backgroundColor: priority.solid }]} />
              <Text style={[styles.pillText, { color: priority.text }]}>
                {priorityLabel(todo.priority)}
              </Text>
            </View>
            {todo.category !== UNCATEGORIZED ? (
              <View style={[styles.pill, { backgroundColor: categoryColors.background }]}>
                <Ionicons name="pricetag" size={11} color={categoryColors.text} aria-hidden />
                <Text numberOfLines={1} style={[styles.pillText, { color: categoryColors.text }]}>
                  {todo.category}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Touchable>
      <View style={styles.actions}>
        <IconButton
          icon="flag-outline"
          label={`Change priority of “${todo.text}” (currently ${todo.priority})`}
          color={priority.text}
          onPress={() => onEditPriority(todo.id)}
        />
        <IconButton
          icon="trash-outline"
          label={`Delete “${todo.text}”`}
          color={colors.textMuted}
          onPress={() => onDelete(todo.id)}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: radius.md,
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
    boxShadow: '0 1px 2px rgba(16, 24, 40, 0.06)',
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    minHeight: TOUCH_TARGET + spacing.md,
    borderRadius: radius.sm,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: spacing.xs },
  text: { ...typography.body },
  textCompleted: { textDecorationLine: 'line-through' },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    maxWidth: 180,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { ...typography.caption, fontSize: 12 },
  actions: { flexDirection: 'row' },
});
