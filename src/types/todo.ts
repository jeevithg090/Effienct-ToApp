export type Priority = 'high' | 'medium' | 'low';

export type TodoFilter = 'all' | 'active' | 'completed';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  /** Category name, or {@link UNCATEGORIZED} when the task has none. */
  category: string;
  /** Creation time in epoch milliseconds; used as a stable tie-breaker when sorting. */
  createdAt: number;
}

export const UNCATEGORIZED = 'Uncategorized';

export const PRIORITIES: readonly Priority[] = ['high', 'medium', 'low'];

export const MAX_TODO_LENGTH = 200;
export const MAX_CATEGORY_LENGTH = 24;
