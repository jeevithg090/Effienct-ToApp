export function formatDate(date: Date, locale = 'en-US'): string {
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(date: Date, locale = 'en-US'): string {
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export function priorityLabel(priority: 'high' | 'medium' | 'low'): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}
