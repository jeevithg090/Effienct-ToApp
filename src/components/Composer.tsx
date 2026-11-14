import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { validateTodoText } from '../lib/todos';
import { radius, spacing, typography, TOUCH_TARGET, useTheme } from '../theme';
import { MAX_TODO_LENGTH, UNCATEGORIZED } from '../types/todo';
import { Button } from './Button';
import { Touchable } from './Touchable';

interface ComposerProps {
  category: string;
  onPickCategory: () => void;
  onSubmit: (text: string) => void;
}

export function Composer({ category, onPickCategory, onSubmit }: ComposerProps) {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const submit = () => {
    const result = validateTodoText(text);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSubmit(result.value);
    setText('');
    setError(null);
  };

  const nearLimit = text.length > MAX_TODO_LENGTH - 30;

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      role="form"
      aria-label="Add a task"
    >
      <Text style={[styles.label, { color: colors.text }]}>New task</Text>
      <TextInput
        value={text}
        onChangeText={(value) => {
          setText(value);
          if (error) setError(null);
        }}
        onSubmitEditing={submit}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="What do you need to get done?"
        placeholderTextColor={colors.textMuted}
        maxLength={MAX_TODO_LENGTH}
        returnKeyType="done"
        submitBehavior="submit"
        aria-label="New task"
        aria-invalid={error ? true : undefined}
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.surfaceMuted,
            borderColor: error ? colors.danger : focused ? colors.focus : 'transparent',
          },
          Platform.OS === 'web' && styles.webInput,
        ]}
      />
      {error ? (
        <Text role="alert" style={[styles.error, { color: colors.danger }]}>
          {error}
        </Text>
      ) : nearLimit ? (
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          {MAX_TODO_LENGTH - text.length} characters left
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Touchable
          role="button"
          aria-label={`Category: ${category}. Change category`}
          onPress={onPickCategory}
          style={[styles.chip, { backgroundColor: colors.primarySoft }]}
        >
          <Ionicons
            name={category === UNCATEGORIZED ? 'pricetag-outline' : 'pricetag'}
            size={16}
            color={colors.primary}
            aria-hidden
          />
          <Text numberOfLines={1} style={[styles.chipText, { color: colors.primary }]}>
            {category === UNCATEGORIZED ? 'No category' : category}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.primary} aria-hidden />
        </Touchable>
        <Button label="Add task" icon="add" onPress={submit} style={styles.addButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  label: { ...typography.label },
  input: {
    ...typography.body,
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 2,
    paddingHorizontal: spacing.md,
  },
  // The coloured border acts as the focus indicator, so hide the browser's default ring.
  webInput: { outlineStyle: 'none' } as object,
  error: { ...typography.caption },
  hint: { ...typography.caption },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: TOUCH_TARGET,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    flexShrink: 1,
  },
  chipText: { ...typography.label, flexShrink: 1 },
  addButton: { flexShrink: 0 },
});
