import { useCallback, useEffect, useRef, useState } from 'react';

import * as storage from '../lib/storage';
import * as ops from '../lib/todos';
import type { Priority, Todo } from '../types/todo';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface UseTodos {
  todos: Todo[];
  categories: string[];
  status: LoadStatus;
  /** Last persistence error, if a save failed. Cleared on the next successful save. */
  saveError: string | null;
  reload: () => void;
  add: (text: string, category: string) => void;
  toggle: (id: string) => void;
  remove: (id: string) => Todo | undefined;
  restore: (todo: Todo) => void;
  updatePriority: (id: string, priority: Priority) => void;
  clearCompleted: () => void;
  addCategory: (name: string) => void;
  deleteCategory: (name: string) => void;
}

/**
 * Owns the task list and category list and keeps them in sync with
 * AsyncStorage (localStorage on web).
 */
export function useTodos(): UseTodos {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Refs mirror the latest state so callbacks can compute the next value
  // synchronously without depending on render timing.
  const todosRef = useRef<Todo[]>([]);
  const categoriesRef = useRef<string[]>([]);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const state = await storage.loadState();
      todosRef.current = state.todos;
      categoriesRef.current = state.categories;
      setTodos(state.todos);
      setCategories(state.categories);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveErrorRef = useRef<string | null>(null);
  const persist = useCallback((task: Promise<void>) => {
    const update = (value: string | null) => {
      // Only touch state when the value changes to avoid needless re-renders.
      if (saveErrorRef.current === value) return;
      saveErrorRef.current = value;
      setSaveError(value);
    };
    task.then(
      () => update(null),
      () => update('Your latest change could not be saved on this device.'),
    );
  }, []);

  const commitTodos = useCallback(
    (next: Todo[]) => {
      todosRef.current = next;
      setTodos(next);
      persist(storage.saveTodos(next));
    },
    [persist],
  );

  const commitCategories = useCallback(
    (next: string[]) => {
      categoriesRef.current = next;
      setCategories(next);
      persist(storage.saveCategories(next));
    },
    [persist],
  );

  const add = useCallback(
    (text: string, category: string) => {
      commitTodos(ops.addTodo(todosRef.current, ops.createTodo(text, { category })));
    },
    [commitTodos],
  );

  const toggle = useCallback(
    (id: string) => commitTodos(ops.toggleTodo(todosRef.current, id)),
    [commitTodos],
  );

  const remove = useCallback(
    (id: string) => {
      const removed = todosRef.current.find((t) => t.id === id);
      commitTodos(ops.removeTodo(todosRef.current, id));
      return removed;
    },
    [commitTodos],
  );

  const restore = useCallback(
    (todo: Todo) => {
      if (todosRef.current.some((t) => t.id === todo.id)) return;
      commitTodos(ops.addTodo(todosRef.current, todo));
    },
    [commitTodos],
  );

  const updatePriority = useCallback(
    (id: string, priority: Priority) =>
      commitTodos(ops.setPriority(todosRef.current, id, priority)),
    [commitTodos],
  );

  const clearCompleted = useCallback(
    () => commitTodos(ops.clearCompleted(todosRef.current)),
    [commitTodos],
  );

  const addCategory = useCallback(
    (name: string) => commitCategories([...categoriesRef.current, name]),
    [commitCategories],
  );

  const deleteCategory = useCallback(
    (name: string) => {
      const next = ops.removeCategory(todosRef.current, categoriesRef.current, name);
      commitCategories(next.categories);
      commitTodos(next.todos);
    },
    [commitCategories, commitTodos],
  );

  return {
    todos,
    categories,
    status,
    saveError,
    reload: () => void load(),
    add,
    toggle,
    remove,
    restore,
    updatePriority,
    clearCompleted,
    addCategory,
    deleteCategory,
  };
}
