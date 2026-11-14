import { formatDate, formatTime, priorityLabel } from '../format';

describe('format helpers', () => {
  const date = new Date(2025, 0, 6, 14, 5, 9);

  it('formats the date in long form', () => {
    expect(formatDate(date)).toBe('Monday, January 6, 2025');
  });

  it('formats the time with seconds in 12-hour clock', () => {
    expect(formatTime(date)).toMatch(/^02:05:09\sPM$/);
  });

  it('capitalises priority labels', () => {
    expect(priorityLabel('high')).toBe('High');
  });
});
