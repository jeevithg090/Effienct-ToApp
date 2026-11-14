import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Todo } from '../types/todo';
import { parseStoredCategories, parseStoredTodos } from './todos';

// Keys are kept from the original version of the app so existing data loads.
export const STORAGE_KEYS = {
  todos: 'todos',
  categories: 'categories',
} as const;

export interface StoredState {
  todos: Todo[];
  categories: string[];
}

export async function loadState(): Promise<StoredState> {
  const [todosRaw, categoriesRaw] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.todos),
    AsyncStorage.getItem(STORAGE_KEYS.categories),
  ]);
  return {
    todos: parseStoredTodos(todosRaw),
    categories: parseStoredCategories(categoriesRaw),
  };
}

export async function saveTodos(todos: readonly Todo[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(todos));
}

export async function saveCategories(categories: readonly string[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
}
