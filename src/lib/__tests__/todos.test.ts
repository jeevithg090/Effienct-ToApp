import { UNCATEGORIZED, type Todo } from '../../types/todo';
import {
  addTodo,
  categoryColorIndex,
  clearCompleted,
  countTodos,
  createId,
  createTodo,
  filterTodos,
  parseStoredCategories,
  parseStoredTodos,
  removeCategory,
  removeTodo,
  setPriority,
  sortTodos,
  toggleTodo,
  validateCategoryName,
  validateTodoText,
} from '../todos';

const make = (overrides: Partial<Todo> & Pick<Todo, 'id'>): Todo => ({
  text: `Task ${overrides.id}`,
  completed: false,
  priority: 'medium',
  category: UNCATEGORIZED,
  createdAt: Number(overrides.id),
  ...overrides,
});

describe('sortTodos', () => {
  it('puts open tasks first, then sorts by priority and creation time', () => {
    const todos = [
      make({ id: '1', priority: 'low' }),
      make({ id: '2', priority: 'high', completed: true }),
      make({ id: '3', priority: 'high' }),
      make({ id: '4', priority: 'medium' }),
      make({ id: '5', priority: 'high' }),
    ];
    expect(sortTodos(todos).map((t) => t.id)).toEqual(['3', '5', '4', '1', '2']);
  });

  it('does not mutate its input', () => {
    const todos = [make({ id: '1', priority: 'low' }), make({ id: '2', priority: 'high' })];
    const copy = [...todos];
    sortTodos(todos);
    expect(todos).toEqual(copy);
  });
});

describe('validateTodoText', () => {
  it('rejects empty and whitespace-only input', () => {
    expect(validateTodoText('')).toEqual({ ok: false, error: expect.any(String) });
    expect(validateTodoText('   \n ')).toMatchObject({ ok: false });
  });

  it('trims and collapses whitespace', () => {
    expect(validateTodoText('  buy   milk ')).toEqual({ ok: true, value: 'buy milk' });
  });

  it('rejects text over the length limit', () => {
    expect(validateTodoText('x'.repeat(201))).toMatchObject({ ok: false });
    expect(validateTodoText('x'.repeat(200))).toMatchObject({ ok: true });
  });
});

describe('validateCategoryName', () => {
  it('rejects duplicates case-insensitively, including the built-in category', () => {
    expect(validateCategoryName('work', ['Work'])).toMatchObject({ ok: false });
    expect(validateCategoryName('uncategorized', [])).toMatchObject({ ok: false });
  });

  it('accepts a new trimmed name', () => {
    expect(validateCategoryName('  Home  ', ['Work'])).toEqual({ ok: true, value: 'Home' });
  });

  it('rejects empty and over-long names', () => {
    expect(validateCategoryName(' ', [])).toMatchObject({ ok: false });
    expect(validateCategoryName('x'.repeat(25), [])).toMatchObject({ ok: false });
  });
});

describe('task operations', () => {
  const base = [make({ id: '1' }), make({ id: '2', priority: 'high' })];

  it('createTodo applies defaults', () => {
    const todo = createTodo('Write tests', { now: 42 });
    expect(todo).toMatchObject({
      text: 'Write tests',
      completed: false,
      priority: 'medium',
      category: UNCATEGORIZED,
      createdAt: 42,
    });
    expect(todo.id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
  });

  it('createId produces distinct ids for the same timestamp', () => {
    const ids = new Set(Array.from({ length: 50 }, () => createId(1)));
    expect(ids.size).toBe(50);
  });

  it('addTodo keeps the list sorted', () => {
    const next = addTodo(base, make({ id: '3', priority: 'high' }));
    expect(next.map((t) => t.id)).toEqual(['2', '3', '1']);
  });

  it('toggleTodo flips completion and re-sorts', () => {
    const next = toggleTodo(sortTodos(base), '2');
    expect(next.find((t) => t.id === '2')?.completed).toBe(true);
    expect(next[next.length - 1].id).toBe('2');
  });

  it('removeTodo removes only the matching task', () => {
    expect(removeTodo(base, '1').map((t) => t.id)).toEqual(['2']);
  });

  it('setPriority updates the priority and re-sorts', () => {
    const next = setPriority(base, '1', 'high');
    expect(next.map((t) => [t.id, t.priority])).toEqual([
      ['1', 'high'],
      ['2', 'high'],
    ]);
  });

  it('clearCompleted drops completed tasks', () => {
    expect(clearCompleted([make({ id: '1', completed: true }), make({ id: '2' })])).toHaveLength(1);
  });

  it('removeCategory moves its tasks back to Uncategorized', () => {
    const result = removeCategory(
      [make({ id: '1', category: 'Work' }), make({ id: '2', category: 'Home' })],
      ['Work', 'Home'],
      'Work',
    );
    expect(result.categories).toEqual(['Home']);
    expect(result.todos.map((t) => t.category)).toEqual([UNCATEGORIZED, 'Home']);
  });

  it('filterTodos and countTodos agree', () => {
    const todos = [make({ id: '1', completed: true }), make({ id: '2' }), make({ id: '3' })];
    expect(filterTodos(todos, 'all')).toHaveLength(3);
    expect(filterTodos(todos, 'active')).toHaveLength(2);
    expect(filterTodos(todos, 'completed')).toHaveLength(1);
    expect(countTodos(todos)).toEqual({ total: 3, active: 2, completed: 1 });
  });
});

describe('categoryColorIndex', () => {
  it('is deterministic and within range', () => {
    expect(categoryColorIndex('Work', 6)).toBe(categoryColorIndex('Work', 6));
    for (const name of ['a', 'Work', 'Groceries', '🔥', 'x'.repeat(100)]) {
      const i = categoryColorIndex(name, 6);
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(6);
    }
  });
});

describe('parseStoredTodos', () => {
  it('returns [] for missing, corrupt or non-array data', () => {
    expect(parseStoredTodos(null)).toEqual([]);
    expect(parseStoredTodos('{not json')).toEqual([]);
    expect(parseStoredTodos('{"a":1}')).toEqual([]);
  });

  it('migrates records saved by the original app version', () => {
    const legacy = JSON.stringify([
      { id: '1700000000000', text: 'Old task', completed: true, priority: 'low', category: 'Work' },
      { id: '1700000000001', text: 'No priority', completed: false },
    ]);
    expect(parseStoredTodos(legacy)).toEqual([
      {
        id: '1700000000001',
        text: 'No priority',
        completed: false,
        priority: 'medium',
        category: UNCATEGORIZED,
        createdAt: 1700000000001,
      },
      {
        id: '1700000000000',
        text: 'Old task',
        completed: true,
        priority: 'low',
        category: 'Work',
        createdAt: 1700000000000,
      },
    ]);
  });

  it('drops invalid entries and de-duplicates ids', () => {
    const raw = JSON.stringify([
      null,
      42,
      { id: 'a', text: '' },
      { id: 'a', text: 'First', priority: 'urgent' },
      { id: 'a', text: 'Second' },
    ]);
    const todos = parseStoredTodos(raw);
    expect(todos.map((t) => t.text)).toEqual(['First', 'Second']);
    expect(new Set(todos.map((t) => t.id)).size).toBe(2);
    expect(todos[0].priority).toBe('medium');
  });
});

describe('parseStoredCategories', () => {
  it('keeps unique, non-empty strings', () => {
    const raw = JSON.stringify(['Work', ' work ', '', 3, 'Home', UNCATEGORIZED]);
    expect(parseStoredCategories(raw)).toEqual(['Work', 'Home']);
  });

  it('handles bad input', () => {
    expect(parseStoredCategories(null)).toEqual([]);
    expect(parseStoredCategories('nope')).toEqual([]);
  });
});
