import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from './src/components/Button';
import { CategorySheet } from './src/components/CategorySheet';
import { ClockCard } from './src/components/ClockCard';
import { Composer } from './src/components/Composer';
import { FilterTabs } from './src/components/FilterTabs';
import { PrioritySheet } from './src/components/PrioritySheet';
import { StateView } from './src/components/StateView';
import { Toast } from './src/components/Toast';
import { TodoItem } from './src/components/TodoItem';
import { useTodos } from './src/hooks/useTodos';
import { countTodos, filterTodos } from './src/lib/todos';
import { spacing, typography, useTheme } from './src/theme';
import { UNCATEGORIZED, type Todo, type TodoFilter } from './src/types/todo';

const EMPTY_COPY: Record<TodoFilter, { title: string; message: string }> = {
  all: {
    title: 'Your list is empty',
    message: 'Add a task above. Tap a task to complete it, or use the flag to set its priority.',
  },
  active: { title: 'All caught up', message: 'Nothing left to do. Enjoy the break!' },
  completed: { title: 'Nothing completed yet', message: 'Finished tasks will show up here.' },
};

type ToastState = { message: string; undo?: Todo } | null;

function TodoScreen() {
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const store = useTodos();

  const [filter, setFilter] = useState<TodoFilter>('all');
  const [category, setCategory] = useState(UNCATEGORIZED);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [priorityTarget, setPriorityTarget] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const counts = useMemo(() => countTodos(store.todos), [store.todos]);
  const visible = useMemo(() => filterTodos(store.todos, filter), [store.todos, filter]);
  const priorityTodo = store.todos.find((t) => t.id === priorityTarget);

  const { remove } = store;
  const handleDelete = useCallback(
    (id: string) => {
      const removed = remove(id);
      if (removed) setToast({ message: 'Task deleted', undo: removed });
    },
    [remove],
  );
  const dismissToast = useCallback(() => setToast(null), []);

  const handleClearCompleted = () => {
    const n = counts.completed;
    store.clearCompleted();
    setToast({ message: `Cleared ${n} completed ${n === 1 ? 'task' : 'tasks'}` });
  };

  const handleDeleteCategory = (name: string) => {
    store.deleteCategory(name);
    if (category === name) setCategory(UNCATEGORIZED);
  };

  const header = (
    <View style={styles.header}>
      <View>
        <Text role="heading" aria-level={1} style={[styles.title, { color: colors.text }]}>
          Efficient Todo
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Plan your day, one priority at a time.
        </Text>
      </View>
      <ClockCard total={counts.total} completed={counts.completed} />
      <Composer
        category={category}
        onPickCategory={() => setCategorySheetOpen(true)}
        onSubmit={(text) => store.add(text, category)}
      />
      {store.saveError ? (
        <View role="alert" style={[styles.banner, { backgroundColor: colors.dangerSoft }]}>
          <Text style={[styles.bannerText, { color: colors.danger }]}>{store.saveError}</Text>
        </View>
      ) : null}
      {store.status === 'ready' && counts.total > 0 ? (
        <View style={styles.toolbar}>
          <FilterTabs
            value={filter}
            onChange={setFilter}
            counts={{ all: counts.total, active: counts.active, completed: counts.completed }}
          />
          {counts.completed > 0 ? (
            <Button
              label="Clear completed"
              variant="danger"
              icon="checkmark-done-outline"
              onPress={handleClearCompleted}
              style={styles.clear}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );

  let emptyState;
  if (store.status === 'loading') {
    emptyState = <StateView loading title="Loading your tasks…" />;
  } else if (store.status === 'error') {
    emptyState = (
      <StateView
        tone="danger"
        icon="cloud-offline-outline"
        title="Couldn’t load your tasks"
        message="Something went wrong reading saved data on this device."
        action={<Button label="Try again" icon="refresh" onPress={store.reload} />}
      />
    );
  } else {
    const copy = EMPTY_COPY[counts.total === 0 ? 'all' : filter];
    emptyState = (
      <StateView
        icon={filter === 'active' && counts.total > 0 ? 'sparkles-outline' : 'list-outline'}
        title={copy.title}
        message={copy.message}
      />
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <FlatList
          data={store.status === 'ready' ? visible : []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TodoItem
              todo={item}
              onToggle={store.toggle}
              onDelete={handleDelete}
              onEditPriority={setPriorityTarget}
            />
          )}
          ListHeaderComponent={header}
          ListEmptyComponent={emptyState}
          ItemSeparatorComponent={Separator}
          keyboardShouldPersistTaps="handled"
          role="list"
          aria-label="Tasks"
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + 96 },
          ]}
        />
      </KeyboardAvoidingView>

      <PrioritySheet
        visible={priorityTodo !== undefined}
        current={priorityTodo?.priority}
        onClose={() => setPriorityTarget(null)}
        onSelect={(priority) => {
          if (priorityTarget) store.updatePriority(priorityTarget, priority);
          setPriorityTarget(null);
        }}
      />
      <CategorySheet
        visible={categorySheetOpen}
        categories={store.categories}
        selected={category}
        onClose={() => setCategorySheetOpen(false)}
        onSelect={(value) => {
          setCategory(value);
          setCategorySheetOpen(false);
        }}
        onCreate={(value) => {
          store.addCategory(value);
          setCategory(value);
          setCategorySheetOpen(false);
        }}
        onDelete={handleDeleteCategory}
      />

      {toast ? (
        <Toast
          message={toast.message}
          bottomInset={insets.bottom}
          actionLabel={toast.undo ? 'Undo' : undefined}
          onAction={
            toast.undo
              ? () => {
                  store.restore(toast.undo as Todo);
                  setToast(null);
                }
              : undefined
          }
          onDismiss={dismissToast}
        />
      ) : null}
      <StatusBar style={dark ? 'light' : 'dark'} />
    </View>
  );
}

function Separator() {
  return <View style={{ height: spacing.sm }} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <TodoScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
  },
  header: { gap: spacing.lg, marginBottom: spacing.lg },
  title: { ...typography.display },
  subtitle: { ...typography.body, fontSize: 15, marginTop: spacing.xxs },
  toolbar: { gap: spacing.sm },
  clear: { alignSelf: 'flex-end', minHeight: 40, paddingHorizontal: spacing.sm },
  banner: { padding: spacing.md, borderRadius: 12 },
  bannerText: { ...typography.caption },
});
