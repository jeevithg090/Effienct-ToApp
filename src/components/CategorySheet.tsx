import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { validateCategoryName } from '../lib/todos';
import { radius, spacing, typography, TOUCH_TARGET, useTheme } from '../theme';
import { MAX_CATEGORY_LENGTH, UNCATEGORIZED } from '../types/todo';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { Sheet } from './Sheet';
import { Touchable } from './Touchable';

interface CategorySheetProps {
  visible: boolean;
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
  onCreate: (category: string) => void;
  onDelete: (category: string) => void;
  onClose: () => void;
}

export function CategorySheet({
  visible,
  categories,
  selected,
  onSelect,
  onCreate,
  onDelete,
  onClose,
}: CategorySheetProps) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const close = () => {
    setName('');
    setError(null);
    onClose();
  };

  const create = () => {
    const result = validateCategoryName(name, categories);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onCreate(result.value);
    setName('');
    setError(null);
  };

  const options = [UNCATEGORIZED, ...categories];

  return (
    <Sheet visible={visible} title="Choose a category" onClose={close}>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <View role="radiogroup" aria-label="Categories" style={styles.listContent}>
          {options.map((category) => {
            const isSelected = category === selected;
            const label = category === UNCATEGORIZED ? 'No category' : category;
            return (
              <View key={category} style={styles.row}>
                <Touchable
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={label}
                  onPress={() => onSelect(category)}
                  style={[
                    styles.option,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected ? colors.primarySoft : colors.surface,
                    },
                  ]}
                >
                  <Ionicons
                    name={category === UNCATEGORIZED ? 'remove-circle-outline' : 'pricetag-outline'}
                    size={18}
                    color={isSelected ? colors.primary : colors.textMuted}
                    aria-hidden
                  />
                  <Text numberOfLines={1} style={[styles.optionText, { color: colors.text }]}>
                    {label}
                  </Text>
                  {isSelected ? (
                    <Ionicons name="checkmark" size={18} color={colors.primary} aria-hidden />
                  ) : null}
                </Touchable>
                {category !== UNCATEGORIZED ? (
                  <IconButton
                    icon="trash-outline"
                    label={`Delete category ${category}`}
                    color={colors.textMuted}
                    onPress={() => onDelete(category)}
                  />
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.text }]}>New category</Text>
        <View style={styles.formRow}>
          <TextInput
            value={name}
            onChangeText={(value) => {
              setName(value);
              if (error) setError(null);
            }}
            onSubmitEditing={create}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="e.g. Work, Errands"
            placeholderTextColor={colors.textMuted}
            maxLength={MAX_CATEGORY_LENGTH}
            aria-label="New category name"
            aria-invalid={error ? true : undefined}
            submitBehavior="submit"
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.surfaceMuted,
                borderColor: error ? colors.danger : focused ? colors.focus : 'transparent',
              },
              Platform.OS === 'web' && ({ outlineStyle: 'none' } as object),
            ]}
          />
          <Button label="Create" onPress={create} />
        </View>
        {error ? (
          <Text role="alert" style={[styles.error, { color: colors.danger }]}>
            {error}
          </Text>
        ) : null}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  list: { maxHeight: 260, flexGrow: 0 },
  listContent: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: TOUCH_TARGET,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  optionText: { ...typography.body, flex: 1 },
  form: { gap: spacing.sm },
  label: { ...typography.label },
  formRow: { flexDirection: 'row', gap: spacing.sm },
  input: {
    ...typography.body,
    flex: 1,
    minWidth: 0,
    minHeight: TOUCH_TARGET,
    borderRadius: radius.md,
    borderWidth: 2,
    paddingHorizontal: spacing.md,
  },
  error: { ...typography.caption },
});
