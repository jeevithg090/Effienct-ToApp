import {
  MAX_CATEGORY_LENGTH,
  MAX_TODO_LENGTH,
  PRIORITIES,
  UNCATEGORIZED,
  type Priority,
  type Todo,
  type TodoFilter,
} from '../types/todo';

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/** Generates a reasonably unique id without extra dependencies. */
export function createId(now: number = Date.now()): string {
  return `${now.toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Orders tasks so that open tasks come first, then by priority (high → low),
 * then oldest first. Returns a new array; the input is not mutated.
 */
export function sortTodos(todos: readonly Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const byPriority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (byPriority !== 0) return byPriority;
    return a.createdAt - b.createdAt;
  });
}

export type ValidationResult = { ok: true; value: string } | { ok: false; error: string };

export function validateTodoText(raw: string): ValidationResult {
  const value = raw.trim().replace(/\s+/g, ' ');
  if (value.length === 0) return { ok: false, error: 'Please enter a task before adding it.' };
  if (value.length > MAX_TODO_LENGTH) {
    return { ok: false, error: `Tasks can be at most ${MAX_TODO_LENGTH} characters.` };
  }
  return { ok: true, value };
}

export function validateCategoryName(raw: string, existing: readonly string[]): ValidationResult {
  const value = raw.trim().replace(/\s+/g, ' ');
  if (value.length === 0) return { ok: false, error: 'Please enter a category name.' };
  if (value.length > MAX_CATEGORY_LENGTH) {
    return { ok: false, error: `Category names can be at most ${MAX_CATEGORY_LENGTH} characters.` };
  }
  const lower = value.toLowerCase();
  if (lower === UNCATEGORIZED.toLowerCase() || existing.some((c) => c.toLowerCase() === lower)) {
    return { ok: false, error: `“${value}” already exists.` };
  }
  return { ok: true, value };
}

export function createTodo(
  text: string,
  options: { category?: string; priority?: Priority; now?: number } = {},
): Todo {
  const now = options.now ?? Date.now();
  return {
    id: createId(now),
    text,
    completed: false,
    priority: options.priority ?? 'medium',
    category: options.category ?? UNCATEGORIZED,
    createdAt: now,
  };
}

export function addTodo(todos: readonly Todo[], todo: Todo): Todo[] {
  return sortTodos([...todos, todo]);
}

export function toggleTodo(todos: readonly Todo[], id: string): Todo[] {
  return sortTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
}

export function removeTodo(todos: readonly Todo[], id: string): Todo[] {
  return todos.filter((t) => t.id !== id);
}

export function setPriority(todos: readonly Todo[], id: string, priority: Priority): Todo[] {
  return sortTodos(todos.map((t) => (t.id === id ? { ...t, priority } : t)));
}

export function clearCompleted(todos: readonly Todo[]): Todo[] {
  return todos.filter((t) => !t.completed);
}

/** Removes a category and moves its tasks back to {@link UNCATEGORIZED}. */
export function removeCategory(
  todos: readonly Todo[],
  categories: readonly string[],
  name: string,
): { todos: Todo[]; categories: string[] } {
  return {
    categories: categories.filter((c) => c !== name),
    todos: todos.map((t) => (t.category === name ? { ...t, category: UNCATEGORIZED } : t)),
  };
}

export function filterTodos(todos: readonly Todo[], filter: TodoFilter): Todo[] {
  switch (filter) {
    case 'active':
      return todos.filter((t) => !t.completed);
    case 'completed':
      return todos.filter((t) => t.completed);
    default:
      return [...todos];
  }
}

export function countTodos(todos: readonly Todo[]): {
  total: number;
  active: number;
  completed: number;
} {
  const completed = todos.filter((t) => t.completed).length;
  return { total: todos.length, active: todos.length - completed, completed };
}

/** Deterministically maps a category name to an index into a palette of `size` colours. */
export function categoryColorIndex(category: string, size: number): number {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % size;
}

function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && (PRIORITIES as readonly string[]).includes(value);
}

/**
 * Validates persisted data and upgrades records written by older versions of
 * the app (which had no `createdAt` and sometimes no `priority`/`category`).
 * Invalid entries are dropped instead of crashing the app.
 */
export function parseStoredTodos(raw: string | null): Todo[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const result: Todo[] = [];
  const seen = new Set<string>();
  data.forEach((item: unknown, index) => {
    if (typeof item !== 'object' || item === null) return;
    const record = item as Record<string, unknown>;
    if (typeof record.text !== 'string' || record.text.trim().length === 0) return;

    let id = typeof record.id === 'string' && record.id.length > 0 ? record.id : createId();
    if (seen.has(id)) id = createId();
    seen.add(id);

    const legacyTimestamp = Number(record.id);
    const createdAt =
      typeof record.createdAt === 'number' && Number.isFinite(record.createdAt)
        ? record.createdAt
        : Number.isFinite(legacyTimestamp) && legacyTimestamp > 0
          ? legacyTimestamp
          : index;

    result.push({
      id,
      text: record.text,
      completed: record.completed === true,
      priority: isPriority(record.priority) ? record.priority : 'medium',
      category:
        typeof record.category === 'string' && record.category.trim().length > 0
          ? record.category
          : UNCATEGORIZED,
      createdAt,
    });
  });
  return sortTodos(result);
}

export function parseStoredCategories(raw: string | null): string[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const result: string[] = [];
  for (const item of data) {
    if (typeof item !== 'string') continue;
    const name = item.trim();
    if (!name || name === UNCATEGORIZED) continue;
    if (result.some((c) => c.toLowerCase() === name.toLowerCase())) continue;
    result.push(name);
  }
  return result;
}
